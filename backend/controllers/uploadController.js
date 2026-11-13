const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { isCloudinaryConfigured, uploadStream, deleteAsset } = require('../config/cloudinary');

// Ensure local fallback directories exist
const LOCAL_GALLERY_DIR = path.resolve(__dirname, '../../frontend/public/images/gallery');
const LOCAL_HERO_DIR = path.resolve(__dirname, '../../frontend/public/images/hero');
try {
  if (!fs.existsSync(LOCAL_GALLERY_DIR)) {
    fs.mkdirSync(LOCAL_GALLERY_DIR, { recursive: true });
  }
  if (!fs.existsSync(LOCAL_HERO_DIR)) {
    fs.mkdirSync(LOCAL_HERO_DIR, { recursive: true });
  }
} catch (e) {
  // Directories will be created upon upload if needed
}

// Configure multer memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error('Invalid file format. Only JPEG, PNG, and WebP images are allowed for security.'),
      false
    );
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 8 * 1024 * 1024, // 8MB limit
  },
  fileFilter,
});

/**
 * Process a single image buffer: uploads to Cloudinary if configured,
 * or saves locally to frontend/public/images/gallery if in development.
 */
const processImageBuffer = async (buffer, originalname, mimetype, folder = 'history-packers/gallery') => {
  if (isCloudinaryConfigured()) {
    try {
      const result = await uploadStream(buffer, {
        folder,
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      });
      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        storageType: 'cloudinary',
      };
    } catch (uploadError) {
      console.warn(
        `[Upload] Cloudinary upload failed (${uploadError.message}).`
      );
      if (process.env.NODE_ENV === 'production') {
        throw new Error(
          `Cloudinary image upload failed (${uploadError.message}). In production, images must be stored persistently on Cloudinary. Please ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set correctly in Render environment variables.`
        );
      }
    }
  } else if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'Cloudinary image storage is not configured in production. Please configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in Render environment variables.'
    );
  }

  // Local storage fallback for local development or when Cloudinary upload fails
  const isHero = folder.includes('hero') || folder.includes('carousel');
  const targetDir = isHero ? LOCAL_HERO_DIR : LOCAL_GALLERY_DIR;
  const urlPrefix = isHero ? '/images/hero' : '/images/gallery';

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const ext = mimetype === 'image/png' ? 'png' : mimetype === 'image/webp' ? 'webp' : 'jpg';
  const cleanBase = path.parse(originalname || (isHero ? 'hero-slide' : 'project')).name.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 40);
  const uniqueFilename = `${cleanBase}-${Date.now()}-${Math.floor(Math.random() * 10000)}.${ext}`;
  const targetPath = path.join(targetDir, uniqueFilename);

  fs.writeFileSync(targetPath, buffer);

  return {
    url: `${urlPrefix}/${uniqueFilename}`,
    publicId: `local_${uniqueFilename}`,
    format: ext,
    width: null,
    height: null,
    bytes: buffer.length,
    storageType: 'local',
  };
};

const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file was provided in the request.',
      });
    }

    const folder = req.body.folder || 'history-packers/gallery';
    const data = await processImageBuffer(req.file.buffer, req.file.originalname, req.file.mimetype, folder);

    res.json({
      success: true,
      message: data.storageType === 'cloudinary' 
        ? 'Image uploaded to Cloudinary successfully.' 
        : 'Image saved locally (Cloudinary credentials not configured).',
      data,
    });
  } catch (err) {
    next(err);
  }
};

const uploadMultipleImages = async (req, res, next) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files were provided in the request.',
      });
    }

    const folder = req.body.folder || 'history-packers/gallery';
    const uploadPromises = files.map((file) =>
      processImageBuffer(file.buffer, file.originalname, file.mimetype, folder)
    );

    const results = await Promise.all(uploadPromises);

    res.json({
      success: true,
      count: results.length,
      message: `${results.length} images processed successfully.`,
      data: results,
    });
  } catch (err) {
    next(err);
  }
};

const deleteImage = async (req, res, next) => {
  try {
    const { publicId } = req.params;
    if (!publicId) {
      return res.status(400).json({ success: false, message: 'publicId parameter is required.' });
    }

    // Handle local file removal
    if (publicId.startsWith('local_')) {
      const filename = publicId.replace('local_', '');
      const candidatePaths = [
        path.join(LOCAL_HERO_DIR, filename),
        path.join(LOCAL_GALLERY_DIR, filename),
      ];
      for (const filePath of candidatePaths) {
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (e) {
            console.warn('[Upload] Failed to unlink local file:', filePath, e.message);
          }
        }
      }
      return res.json({
        success: true,
        message: 'Local image asset deleted.',
      });
    }

    // Handle Cloudinary removal
    if (!isCloudinaryConfigured()) {
      return res.json({
        success: true,
        message: 'Cloudinary credentials not configured; local reference removed.',
      });
    }

    const result = await deleteAsset(publicId);
    res.json({
      success: true,
      message: 'Image asset deleted from Cloudinary.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const getUploadStatus = (req, res) => {
  res.json({
    success: true,
    isCloudinaryConfigured: isCloudinaryConfigured(),
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ? `${process.env.CLOUDINARY_CLOUD_NAME.slice(0, 3)}***` : null,
    storageFallback: 'local_storage_ready',
  });
};

module.exports = {
  upload,
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  getUploadStatus,
  processImageBuffer,
};


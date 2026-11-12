const cloudinary = require('cloudinary').v2;

const isConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  console.log('[Cloudinary] SDK initialized with provided credentials.');
} else {
  console.warn('[Cloudinary] Credentials missing in environment. Cloudinary upload endpoint will report unconfigured until added to backend/.env.');
}

/**
 * Upload buffer to Cloudinary
 */
const uploadStream = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!isConfigured) {
      return reject(new Error('Cloudinary credentials are not configured in backend/.env'));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'history-packers',
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
};

/**
 * Delete asset from Cloudinary
 */
const deleteAsset = async (publicId) => {
  if (!isConfigured) {
    throw new Error('Cloudinary credentials are not configured in backend/.env');
  }
  return cloudinary.uploader.destroy(publicId);
};

module.exports = {
  cloudinary,
  isCloudinaryConfigured: () => Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ),
  uploadStream,
  deleteAsset,
};


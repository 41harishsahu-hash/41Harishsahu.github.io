const path = require('path');
const fs = require('fs');
const root = path.resolve(__dirname, '..');
require('dotenv').config({ path: path.join(root, '.env') });
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const { Gallery, HeroCarousel } = require('../models/Content');
const { isCloudinaryConfigured, uploadStream } = require('../config/cloudinary');

const GALLERY_ASSETS_DIR = path.resolve(__dirname, '../../frontend/public/images/gallery');
const HERO_ASSETS_DIR = path.resolve(__dirname, '../../frontend/public/images/hero');
const BACKUP_DIR = path.resolve(__dirname, '../backups');

const migrate = async () => {
  try {
    console.log('======================================================================');
    console.log('  STARTING SAFE GALLERY & CAROUSEL IMAGE AUDIT AND MIGRATION');
    console.log('======================================================================');

    await connectDB();

    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    // 1. Create full backup of current collections
    const allGalleryDocs = await Gallery.find({}).lean();
    const allHeroDocs = await HeroCarousel.find({}).lean();

    const timestamp = Date.now();
    const backupFile = path.join(BACKUP_DIR, `image_migration_backup_${timestamp}.json`);
    fs.writeFileSync(
      backupFile,
      JSON.stringify({ timestamp, gallery: allGalleryDocs, hero: allHeroDocs }, null, 2),
      'utf8'
    );
    console.log(`[Backup] Safe rollback snapshot saved to: ${backupFile}`);

    // List all available local assets
    const availableGalleryAssets = fs.existsSync(GALLERY_ASSETS_DIR) ? fs.readdirSync(GALLERY_ASSETS_DIR) : [];
    console.log(`[Assets] Found ${availableGalleryAssets.length} committed gallery asset(s) in repository.`);

    let galleryUpdatedCount = 0;

    for (const doc of allGalleryDocs) {
      const currentUrl = doc.imageUrl || '';
      console.log(`\nInspecting Gallery item [${doc._id}] "${doc.title}": current URL = "${currentUrl}"`);

      // If already a valid Cloudinary HTTPS URL, skip
      if (currentUrl.startsWith('https://res.cloudinary.com/')) {
        console.log(`  -> Already hosted on Cloudinary CDN. Skipping.`);
        continue;
      }

      // Check if current URL resolves to an existing file
      const currentFilename = path.basename(currentUrl);
      const exactFileExists = availableGalleryAssets.includes(currentFilename);

      if (exactFileExists) {
        console.log(`  -> Exact asset file exists in repository: ${currentFilename}`);
      } else {
        console.log(`  -> File "${currentFilename}" is missing or contains an ephemeral timestamp.`);

        // Find matching original file by prefix
        // e.g., 'WhatsApp-Image-2026-11-04-at-2-48-55-PM'
        const baseMatch = currentFilename.match(/^(WhatsApp-Image-[0-9-]+-at-[0-9-]+-[AP]M)/i);
        const prefix = baseMatch ? baseMatch[1] : null;

        let matchedAsset = null;
        if (prefix) {
          matchedAsset = availableGalleryAssets.find((f) => f.startsWith(prefix));
        }

        if (matchedAsset) {
          console.log(`  -> Found matching committed original asset: "${matchedAsset}"`);
          const newUrl = `/images/gallery/${matchedAsset}`;
          const newPublicId = `local_${matchedAsset}`;

          await Gallery.updateOne(
            { _id: doc._id },
            { $set: { imageUrl: newUrl, publicId: newPublicId } }
          );
          console.log(`  -> Successfully updated document [${doc._id}] to use valid asset URL: "${newUrl}"`);
          galleryUpdatedCount++;
        } else {
          console.warn(`  [ATTENTION] No committed original file found for "${currentFilename}". Admin re-upload required.`);
        }
      }
    }

    console.log('\n======================================================================');
    console.log(`  MIGRATION SUMMARY: ${galleryUpdatedCount} gallery document(s) repaired.`);
    console.log('======================================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

migrate();

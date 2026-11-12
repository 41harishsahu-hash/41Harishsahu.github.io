require('dotenv').config();
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const { connectDB } = require('../config/db');
const User = require('../models/User');
const { Gallery } = require('../models/Content');
const { generateTokens } = require('../middleware/auth');

const runGalleryVerification = async () => {
  try {
    console.log('[Gallery Test] Connecting to MongoDB...');
    await connectDB();
    console.log('[Gallery Test] Connected to MongoDB.');

    // 1. Authenticate admin and customer
    const admin = await User.findOne({ email: 'admin@historypackers.com', role: 'admin' });
    if (!admin) throw new Error('Admin account not found in database.');
    const adminToken = generateTokens(admin).accessToken;

    let customer = await User.findOne({ email: 'rahul.sharma@example.com', role: 'customer' });
    if (!customer) {
      customer = await User.create({
        name: 'Rahul Sharma',
        email: 'rahul.sharma@example.com',
        mobile: '9876543210',
        password: 'Customer@Password123',
        role: 'customer',
        status: 'active',
      });
    }
    const customerToken = generateTokens(customer).accessToken;

    console.log('\n--- 1. Testing RBAC on Admin Gallery Routes ---');
    const unauth = await request(app).get('/api/admin/gallery');
    console.log('Unauthenticated access:', unauth.status, unauth.body?.message);
    if (unauth.status !== 401) throw new Error('Unauthenticated should be 401');

    const cust = await request(app)
      .get('/api/admin/gallery')
      .set('Authorization', `Bearer ${customerToken}`);
    console.log('Customer access:', cust.status, cust.body?.message);
    if (cust.status !== 403) throw new Error('Customer access should be 403');

    const adm = await request(app)
      .get('/api/admin/gallery')
      .set('Authorization', `Bearer ${adminToken}`);
    console.log('Admin access:', adm.status, `count: ${adm.body?.count}`);
    if (adm.status !== 200) throw new Error('Admin access should be 200');

    console.log('\n--- 2. Testing Upload Status Route ---');
    const statusRes = await request(app)
      .get('/api/admin/uploads/status')
      .set('Authorization', `Bearer ${adminToken}`);
    console.log('Upload status:', statusRes.status, statusRes.body);
    if (statusRes.status !== 200 || !statusRes.body?.storageFallback) {
      throw new Error('Upload status failed');
    }

    console.log('\n--- 3. Testing Single Project Creation (Active vs Draft) ---');
    const activeProject = {
      title: 'Automated Test Household Move',
      category: 'Household Shifting',
      description: 'Full 3BHK household relocation from Mansarovar to Vaishali Nagar Jaipur.',
      location: 'Mansarovar to Vaishali Nagar, Jaipur',
      projectDate: '2026-11-10',
      imageUrl: '/images/gallery/test-household.jpg',
      publicId: 'local_test-household.jpg',
      isPublished: true,
      displayOrder: 1,
    };
    const createActiveRes = await request(app)
      .post('/api/admin/gallery')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(activeProject);
    console.log('Active project creation:', createActiveRes.status, createActiveRes.body?.message);
    if (createActiveRes.status !== 201) throw new Error('Failed to create active project');
    const activeId = createActiveRes.body.data._id;

    const draftProject = {
      title: 'Automated Test Office Relocation Draft',
      category: 'Office Relocation',
      description: 'Corporate workstation relocation in progress.',
      location: 'C-Scheme, Jaipur',
      projectDate: '2026-11-11',
      imageUrl: '/images/gallery/test-office-draft.jpg',
      publicId: 'local_test-office-draft.jpg',
      isPublished: false,
      displayOrder: 2,
    };
    const createDraftRes = await request(app)
      .post('/api/admin/gallery')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(draftProject);
    console.log('Draft project creation:', createDraftRes.status, createDraftRes.body?.message);
    if (createDraftRes.status !== 201) throw new Error('Failed to create draft project');
    const draftId = createDraftRes.body.data._id;

    console.log('\n--- 4. Verifying Public Gallery API Filters Draft Projects ---');
    const publicRes = await request(app).get('/api/gallery');
    console.log('Public gallery fetch:', publicRes.status, `count: ${publicRes.body?.count}`);
    if (publicRes.status !== 200) throw new Error('Public gallery should return 200');

    const publicIds = publicRes.body.data.map((item) => item._id);
    if (!publicIds.includes(activeId)) {
      throw new Error('Published project must appear in public gallery');
    }
    if (publicIds.includes(draftId)) {
      throw new Error('Draft project must NOT appear in public gallery');
    }
    console.log('SUCCESS: Public gallery returns only published items!');

    console.log('\n--- 5. Testing Multiple Images Upload Endpoint ---');
    const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
    const multiUploadRes = await request(app)
      .post('/api/admin/uploads/multiple')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('folder', 'history-packers/gallery')
      .attach('images', pngBuffer, 'test-gallery-upload-1.png')
      .attach('images', pngBuffer, 'test-gallery-upload-2.png');
    console.log('Multiple upload response:', multiUploadRes.status, multiUploadRes.body?.count, 'files processed');
    if (multiUploadRes.status !== 200 || multiUploadRes.body?.count !== 2) {
      throw new Error('Multiple upload failed');
    }
    const uploadedFiles = multiUploadRes.body.data;

    console.log('\n--- 6. Testing Project Update & Reorder ---');
    const updateRes = await request(app)
      .patch(`/api/admin/gallery/${activeId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Updated Automated Test Household Move', category: 'Household Shifting' });
    console.log('Update project:', updateRes.status, updateRes.body?.data?.title);
    if (updateRes.status !== 200) throw new Error('Update project failed');

    const reorderRes = await request(app)
      .patch('/api/admin/gallery/reorder')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        items: [
          { id: activeId, displayOrder: 5 },
          { id: draftId, displayOrder: 6 },
        ],
      });
    console.log('Reorder response:', reorderRes.status, reorderRes.body?.message);
    if (reorderRes.status !== 200) throw new Error('Reorder failed');

    console.log('\n--- 7. Cleaning Up Test Gallery Items and Uploaded Files ---');
    const testIds = [activeId, draftId];
    for (const id of testIds) {
      const delRes = await request(app)
        .delete(`/api/admin/gallery/${id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      if (delRes.status !== 200) throw new Error(`Delete failed for ${id}`);
    }

    for (const file of uploadedFiles) {
      const delFileRes = await request(app)
        .delete(`/api/admin/uploads/${encodeURIComponent(file.publicId)}`)
        .set('Authorization', `Bearer ${adminToken}`);
      console.log('Cleaned up uploaded file:', file.publicId, delFileRes.status);
    }

    console.log('\n======================================================');
    console.log('ALL WORK GALLERY VERIFICATION TESTS PASSED (100%)!');
    console.log('======================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('\n[TEST FAILED]:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
};

runGalleryVerification();

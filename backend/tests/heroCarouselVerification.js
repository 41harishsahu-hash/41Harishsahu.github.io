require('dotenv').config();
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const { connectDB } = require('../config/db');
const User = require('../models/User');
const { HeroCarousel } = require('../models/Content');
const { generateTokens } = require('../middleware/auth');

const runHeroCarouselVerification = async () => {
  try {
    console.log('[Hero Carousel Test] Connecting to MongoDB...');
    await connectDB();
    console.log('[Hero Carousel Test] Connected to MongoDB.');

    // 1. Get tokens
    const admin = await User.findOne({ email: 'admin@historypackers.com', role: 'admin' });
    if (!admin) {
      throw new Error('Admin account not found in database.');
    }
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

    console.log('\n--- 1. Testing RBAC on Admin Carousel Routes ---');

    // Unauthenticated
    const unauth = await request(app).get('/api/admin/hero-carousel');
    console.log('Unauthenticated access:', unauth.status, unauth.body?.message);
    if (unauth.status !== 401) throw new Error('Unauthenticated should be 401');

    // Customer
    const cust = await request(app)
      .get('/api/admin/hero-carousel')
      .set('Authorization', `Bearer ${customerToken}`);
    console.log('Customer access:', cust.status, cust.body?.message);
    if (cust.status !== 403) throw new Error('Customer access should be 403');

    // Admin
    const adm = await request(app)
      .get('/api/admin/hero-carousel')
      .set('Authorization', `Bearer ${adminToken}`);
    console.log('Admin access:', adm.status, `count: ${adm.body?.count}`);
    if (adm.status !== 200) throw new Error('Admin access should be 200');

    console.log('\n--- 2. Testing Slide Creation (Active vs Inactive vs Draft) ---');

    // Create an active published slide
    const activeSlide = {
      title: 'Verification Slide - Professional Relocation',
      description: 'Tested via automated verification suite.',
      imageUrl: '/images/hero/test-slide-active.svg',
      publicId: 'local_test-slide-active.svg',
      displayOrder: 10,
      isActive: true,
      isPublished: true,
    };
    const createActiveRes = await request(app)
      .post('/api/admin/hero-carousel')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(activeSlide);
    console.log('Active slide creation:', createActiveRes.status, createActiveRes.body?.message);
    if (createActiveRes.status !== 201) throw new Error('Failed to create active slide');
    const activeId = createActiveRes.body.data._id;

    // Create an inactive draft slide
    const draftSlide = {
      title: 'Verification Slide - Inactive Draft',
      description: 'This slide must NOT appear on public hero section.',
      imageUrl: '/images/hero/test-slide-draft.svg',
      publicId: 'local_test-slide-draft.svg',
      displayOrder: 11,
      isActive: false,
      isPublished: false,
    };
    const createDraftRes = await request(app)
      .post('/api/admin/hero-carousel')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(draftSlide);
    console.log('Draft slide creation:', createDraftRes.status, createDraftRes.body?.message);
    if (createDraftRes.status !== 201) throw new Error('Failed to create draft slide');
    const draftId = createDraftRes.body.data._id;

    console.log('\n--- 3. Verifying Public API Filters Inactive & Draft Slides ---');

    const publicRes = await request(app).get('/api/hero-carousel');
    console.log('Public hero carousel fetch:', publicRes.status, `count: ${publicRes.body?.count}`);
    if (publicRes.status !== 200) throw new Error('Public carousel should be 200');

    const publicIds = publicRes.body.data.map((s) => s._id);
    if (!publicIds.includes(activeId)) {
      throw new Error('Active published slide MUST be returned in public carousel');
    }
    if (publicIds.includes(draftId)) {
      throw new Error('Inactive/Draft slide MUST NOT be returned in public carousel');
    }
    console.log('SUCCESS: Public API strictly returns only active and published slides!');

    console.log('\n--- 4. Testing Admin Update, Reorder & Delete ---');

    // Update
    const updateRes = await request(app)
      .patch(`/api/admin/hero-carousel/${activeId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Updated Verification Slide Title' });
    console.log('Update slide:', updateRes.status, updateRes.body?.data?.title);
    if (updateRes.status !== 200 || updateRes.body?.data?.title !== 'Updated Verification Slide Title') {
      throw new Error('Update slide failed');
    }

    // Reorder
    const reorderRes = await request(app)
      .patch('/api/admin/hero-carousel/reorder')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ items: [{ id: activeId, displayOrder: 1 }] });
    console.log('Reorder slides:', reorderRes.status, reorderRes.body?.message);
    if (reorderRes.status !== 200) throw new Error('Reorder slides failed');

    // Delete
    const del1 = await request(app)
      .delete(`/api/admin/hero-carousel/${activeId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    const del2 = await request(app)
      .delete(`/api/admin/hero-carousel/${draftId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    console.log('Delete active slide:', del1.status, del1.body?.message);
    console.log('Delete draft slide:', del2.status, del2.body?.message);
    if (del1.status !== 200 || del2.status !== 200) throw new Error('Delete slide failed');

    console.log('\n--- 5. Testing Image Upload to Hero Folder & Cleanup ---');

    const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
    const uploadRes = await request(app)
      .post('/api/admin/uploads')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('folder', 'history-packers/hero')
      .attach('image', pngBuffer, 'hero-logistics-truck.png');

    console.log('Upload image:', uploadRes.status, uploadRes.body?.message, uploadRes.body?.data?.url);
    if (uploadRes.status !== 200 || !uploadRes.body?.data?.url) {
      throw new Error('Upload image failed');
    }

    const uploadedPublicId = uploadRes.body.data.publicId;
    const delUpload = await request(app)
      .delete(`/api/admin/uploads/${encodeURIComponent(uploadedPublicId)}`)
      .set('Authorization', `Bearer ${adminToken}`);
    console.log('Delete uploaded asset:', delUpload.status, delUpload.body?.message);
    if (delUpload.status !== 200) throw new Error('Delete uploaded asset failed');

    console.log('\n======================================================');
    console.log('ALL HERO CAROUSEL VERIFICATION TESTS PASSED (100%)!');
    console.log('======================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('\n[TEST FAILED]:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
};

runHeroCarouselVerification();


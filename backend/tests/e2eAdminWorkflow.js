require('dotenv').config();
const mongoose = require('mongoose');
const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../app');
const { connectDB } = require('../config/db');
const User = require('../models/User');
const { Gallery, HeroCarousel } = require('../models/Content');

const runE2EAdminWorkflow = async () => {
  try {
    console.log('[E2E Test] Connecting to MongoDB...');
    await connectDB();
    console.log('[E2E Test] Connected to MongoDB.');

    // Step 1: Login as administrator
    console.log('\n--- Step 1: Admin Login with Credentials ---');
    const loginRes = await request(app)
      .post('/api/auth/admin/login')
      .send({
        email: 'admin@historypackers.com',
        password: 'Admin@Password123',
      });

    console.log('Admin login response:', loginRes.status, loginRes.body?.message);
    if (loginRes.status !== 200 || !loginRes.body?.data?.accessToken) {
      throw new Error(`Admin login failed: ${JSON.stringify(loginRes.body)}`);
    }

    const { accessToken, refreshToken, user: adminUser } = loginRes.body.data;
    console.log(`Authenticated as: ${adminUser.name} (${adminUser.email}), Role: ${adminUser.role}`);
    console.log('Access token and Refresh token obtained successfully.');

    // Step 2: Verify Unauthorized and Customer Access Restrictions
    console.log('\n--- Step 2: Testing Access Restrictions (Unauthorized & Customer) ---');
    const unauthGallery = await request(app).get('/api/admin/gallery');
    console.log('Unauthenticated GET /api/admin/gallery status:', unauthGallery.status);
    if (unauthGallery.status !== 401) throw new Error('Unauthenticated should receive 401');

    const unauthUpload = await request(app)
      .post('/api/admin/uploads')
      .field('folder', 'history-packers/gallery')
      .attach('image', Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), 'unauth-test.png');
    console.log('Unauthenticated POST /api/admin/uploads status:', unauthUpload.status);
    if (unauthUpload.status !== 401) throw new Error('Unauthenticated upload must receive 401');

    // Customer login / token
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
    const customerLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'rahul.sharma@example.com', password: 'Customer@Password123' });
    const customerToken = customerLoginRes.body?.data?.accessToken;

    const custGallery = await request(app)
      .get('/api/admin/gallery')
      .set('Authorization', `Bearer ${customerToken}`);
    console.log('Customer GET /api/admin/gallery status:', custGallery.status);
    if (custGallery.status !== 403) throw new Error('Customer should receive 403');

    // Step 3: Open Work Gallery Management (Authenticated GET)
    console.log('\n--- Step 3: Authenticated Work Gallery GET Request ---');
    const galleryRes = await request(app)
      .get('/api/admin/gallery')
      .set('Authorization', `Bearer ${accessToken}`);
    console.log('Authenticated Gallery fetch status:', galleryRes.status, `count: ${galleryRes.body?.count}`);
    if (galleryRes.status !== 200) throw new Error('Authenticated gallery fetch failed');

    // Step 4: Upload Real Test Image via multipart/form-data
    console.log('\n--- Step 4: Upload Real Image via Authenticated API ---');
    // 1x1 valid transparent PNG
    const realPngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    const uploadRes = await request(app)
      .post('/api/admin/uploads')
      .set('Authorization', `Bearer ${accessToken}`)
      .field('folder', 'history-packers/gallery')
      .attach('image', realPngBuffer, 'history-packers-shifting-proof.png');

    console.log('Image upload status:', uploadRes.status);
    console.log('Upload response message:', uploadRes.body?.message);
    console.log('Upload storage type:', uploadRes.body?.data?.storageType);
    console.log('Uploaded URL:', uploadRes.body?.data?.url);
    console.log('Uploaded PublicId:', uploadRes.body?.data?.publicId);

    if (uploadRes.status !== 200 || !uploadRes.body?.data?.url) {
      throw new Error(`Upload failed: ${JSON.stringify(uploadRes.body)}`);
    }

    const { url: uploadedUrl, publicId: uploadedPublicId, storageType } = uploadRes.body.data;

    // Step 5: Create MongoDB Gallery Project Record
    console.log('\n--- Step 5: Save Gallery Project Record in MongoDB ---');
    const projectPayload = {
      title: 'E2E Verified Relocation in Mansarovar',
      category: 'Household Shifting',
      description: 'Complete 3BHK household goods safely packed and shifted with high-density bubble wrap.',
      projectDate: '2026-11-12',
      location: 'Mansarovar, Jaipur',
      displayOrder: 1,
      isPublished: true,
      imageUrl: uploadedUrl,
      publicId: uploadedPublicId,
    };

    const createRes = await request(app)
      .post('/api/admin/gallery')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(projectPayload);

    console.log('Create gallery item status:', createRes.status, createRes.body?.message);
    if (createRes.status !== 201 || !createRes.body?.data?._id) {
      throw new Error(`Failed to create gallery record: ${JSON.stringify(createRes.body)}`);
    }

    const savedProjectId = createRes.body.data._id;
    console.log('Saved Gallery Record ID:', savedProjectId);

    // Step 6: Verify Persistence in MongoDB
    console.log('\n--- Step 6: Verify Database Record Persistence ---');
    const dbRecord = await Gallery.findById(savedProjectId);
    if (!dbRecord) {
      throw new Error('Record not found in MongoDB after creation!');
    }
    console.log('MongoDB record verified:');
    console.log(`  Title: ${dbRecord.title}`);
    console.log(`  Category: ${dbRecord.category}`);
    console.log(`  Image URL: ${dbRecord.imageUrl}`);
    console.log(`  Public ID: ${dbRecord.publicId}`);
    console.log(`  Published: ${dbRecord.isPublished}`);

    // Step 7: Verify Public Work Gallery API
    console.log('\n--- Step 7: Verify Public Gallery API Endpoint ---');
    const publicGalleryRes = await request(app).get('/api/gallery');
    console.log('Public gallery GET status:', publicGalleryRes.status, `count: ${publicGalleryRes.body?.count}`);
    const foundInPublic = publicGalleryRes.body?.data?.some((item) => item._id === savedProjectId.toString());
    if (!foundInPublic) {
      throw new Error('Created published project did NOT appear in public gallery response!');
    }
    console.log('SUCCESS: Newly uploaded project is visible on public gallery page!');

    // Step 8: Open Hero Carousel Management (Authenticated GET)
    console.log('\n--- Step 8: Authenticated Hero Carousel GET Request ---');
    const carouselRes = await request(app)
      .get('/api/admin/hero-carousel')
      .set('Authorization', `Bearer ${accessToken}`);
    console.log('Authenticated Hero Carousel fetch status:', carouselRes.status, `count: ${carouselRes.body?.count}`);
    if (carouselRes.status !== 200) throw new Error('Authenticated carousel fetch failed');

    // Step 9: Verify Token Refresh Workflow
    console.log('\n--- Step 9: Verify Token Refresh & Session Persistence ---');
    const refreshRes = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken });

    console.log('Token refresh status:', refreshRes.status);
    if (refreshRes.status !== 200 || !refreshRes.body?.data?.accessToken) {
      throw new Error(`Token refresh failed: ${JSON.stringify(refreshRes.body)}`);
    }
    const newAccessToken = refreshRes.body.data.accessToken;

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${newAccessToken}`);
    console.log('GET /api/auth/me with new token status:', meRes.status, `user: ${meRes.body?.data?.user?.email}`);
    if (meRes.status !== 200 || meRes.body?.data?.user?.email !== 'admin@historypackers.com') {
      throw new Error('Failed to fetch user with refreshed token');
    }

    // Step 10: Clean Up Test Records & Files
    console.log('\n--- Step 10: Cleaning Up Test Records & Uploads ---');
    const deleteProjectRes = await request(app)
      .delete(`/api/admin/gallery/${savedProjectId}`)
      .set('Authorization', `Bearer ${newAccessToken}`);
    console.log('Delete test gallery item status:', deleteProjectRes.status);

    const deleteUploadRes = await request(app)
      .delete(`/api/admin/uploads/${encodeURIComponent(uploadedPublicId)}`)
      .set('Authorization', `Bearer ${newAccessToken}`);
    console.log('Delete uploaded test image status:', deleteUploadRes.status);

    console.log('\n=============================================================');
    console.log('ALL 10 MANDATORY WORKFLOW TESTS PASSED PERFECTLY (100%)!');
    console.log(`Cloudinary/Storage Mode: ${storageType}`);
    console.log('=============================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('\n[E2E TEST FAILED]:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
};

runE2EAdminWorkflow();

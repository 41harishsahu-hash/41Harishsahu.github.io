const request = require('supertest');
const app = require('../app');
const { connectDB } = require('../config/db');
const User = require('../models/User');

const runTests = async () => {
  try {
    await connectDB();
    console.log('[Verification] Connected to database.');

    // 1. Verify correct admin credentials
    console.log('Testing: Admin login with expected credentials...');
    const res1 = await request(app)
      .post('/api/auth/admin/login')
      .send({
        email: 'admin@historypackers.com',
        password: 'Admin@Password123',
      });

    console.log('1. Correct Credentials:');
    console.log('   Status Code:', res1.status);
    console.log('   Success:', res1.body.success);
    console.log('   Role:', res1.body.data?.user?.role);
    console.log('   AccessToken Issued:', Boolean(res1.body.data?.accessToken));

    if (res1.status !== 200 || !res1.body.success || res1.body.data?.user?.role !== 'admin') {
      throw new Error('Test 1 Failed: Admin login with correct credentials did not succeed.');
    }
    const adminToken = res1.body.data?.accessToken;

    // 2. Verify incorrect password rejection
    console.log('\nTesting: Admin login with incorrect password...');
    const res2 = await request(app)
      .post('/api/auth/admin/login')
      .send({
        email: 'admin@historypackers.com',
        password: 'WrongPassword999',
      });

    console.log('2. Incorrect Password:');
    console.log('   Status Code:', res2.status);
    console.log('   Success:', res2.body.success);
    console.log('   Message:', res2.body.message);

    if (res2.status !== 401 || res2.body.success) {
      throw new Error('Test 2 Failed: Incorrect password was not rejected.');
    }

    // 3. Verify customer cannot login as admin
    console.log('\nTesting: Customer attempting admin login...');
    let cust = await User.findOne({ email: 'customer_verify@test.com' });
    if (!cust) {
      cust = await User.create({
        name: 'Verify Customer',
        email: 'customer_verify@test.com',
        mobile: '9876543210',
        password: 'CustomerPassword123',
        role: 'customer',
        status: 'active',
      });
    }

    const res3 = await request(app)
      .post('/api/auth/admin/login')
      .send({
        email: 'customer_verify@test.com',
        password: 'CustomerPassword123',
      });

    console.log('3. Customer Admin Login Rejection:');
    console.log('   Status Code:', res3.status);
    console.log('   Success:', res3.body.success);
    console.log('   Message:', res3.body.message);

    if (res3.status !== 401 || res3.body.success) {
      throw new Error('Test 3 Failed: Customer account was not rejected on admin login.');
    }

    // 4. Verify customer cannot access protected admin routes
    console.log('\nTesting: Customer accessing protected admin route...');
    const custLoginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'customer_verify@test.com',
        password: 'CustomerPassword123',
      });
    const customerToken = custLoginRes.body.data?.accessToken;

    const res4 = await request(app)
      .get('/api/admin/dashboard/stats')
      .set('Authorization', `Bearer ${customerToken}`);

    console.log('4. Customer Access to Admin Route:');
    console.log('   Status Code:', res4.status);
    console.log('   Success:', res4.body.success);
    console.log('   Message:', res4.body.message);

    if (res4.status !== 403 || res4.body.success) {
      throw new Error('Test 4 Failed: Customer was not blocked from admin route.');
    }

    // 5. Verify admin CAN access protected admin routes
    console.log('\nTesting: Admin accessing protected admin route...');
    const res5 = await request(app)
      .get('/api/admin/dashboard/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    console.log('5. Admin Access to Admin Route:');
    console.log('   Status Code:', res5.status);
    console.log('   Success:', res5.body.success);
    console.log('   Has Stats:', Boolean(res5.body.data?.stats));

    if (res5.status !== 200 || !res5.body.success) {
      throw new Error('Test 5 Failed: Admin could not access admin route.');
    }

    // 6. Verify unauthenticated access to admin routes is rejected
    console.log('\nTesting: Unauthenticated access to admin route...');
    const res6 = await request(app).get('/api/admin/dashboard/stats');

    console.log('6. Unauthenticated Access:');
    console.log('   Status Code:', res6.status);
    console.log('   Success:', res6.body.success);
    console.log('   Message:', res6.body.message);

    if (res6.status !== 401 || res6.body.success) {
      throw new Error('Test 6 Failed: Unauthenticated request was not rejected.');
    }

    console.log('\n=============================================');
    console.log('ALL 6 ADMIN AUTHENTICATION TESTS PASSED 100%!');
    console.log('=============================================');

    // Clean up temporary test customer
    await User.deleteOne({ email: 'customer_verify@test.com' });
    process.exit(0);
  } catch (err) {
    console.error('[Verification Failed]', err.message);
    process.exit(1);
  }
};

runTests();


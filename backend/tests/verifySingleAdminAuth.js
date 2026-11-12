require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');

const runVerification = async () => {
  const authorizedAdminEmail = (process.env.ADMIN_EMAIL || 'historypackersandmovers@gmail.com').toLowerCase().trim();
  const validPassword = 'Admin@Password123';

  console.log('======================================================================');
  console.log('STARTING TARGETED ADMIN ACCESS & AUTHORIZATION VERIFICATION');
  console.log(`Configured ADMIN_EMAIL: ${authorizedAdminEmail}`);
  console.log('======================================================================\n');

  // Helper to execute in-process requests to Express app
  const makeRequest = (method, path, body = null, headers = {}) => {
    return new Promise((resolve) => {
      const server = app.listen(0, async () => {
        const port = server.address().port;
        const reqData = body ? JSON.stringify(body) : null;

        const req = http.request(
          {
            hostname: '127.0.0.1',
            port,
            path,
            method,
            headers: {
              'Content-Type': 'application/json',
              ...(reqData ? { 'Content-Length': Buffer.byteLength(reqData) } : {}),
              ...headers,
            },
          },
          (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
              server.close();
              try {
                resolve({ status: res.statusCode, data: JSON.parse(data) });
              } catch (e) {
                resolve({ status: res.statusCode, raw: data });
              }
            });
          }
        );

        req.on('error', (err) => {
          server.close();
          resolve({ status: 500, error: err.message });
        });

        if (reqData) req.write(reqData);
        req.end();
      });
    });
  };

  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 4000 });

    // TEST 1: Unauthorized Email Login Attempt
    console.log('[TEST 1] Attempting admin login with unauthorized email ("unauthorized@gmail.com")...');
    const test1 = await makeRequest('POST', '/api/auth/admin/login', {
      email: 'unauthorized@gmail.com',
      password: validPassword,
    });
    console.log(`  -> Status: ${test1.status}, Message: "${test1.data?.message}"`);
    if (test1.status === 401 && test1.data?.success === false) {
      console.log('  [PASS] Unauthorized email was strictly rejected with 401.\n');
    } else {
      throw new Error(`TEST 1 FAILED: Expected 401, got ${test1.status}`);
    }

    // TEST 2: Authorized Admin Email with Wrong Password
    console.log(`[TEST 2] Attempting admin login with authorized email ("${authorizedAdminEmail}") and WRONG password...`);
    const test2 = await makeRequest('POST', '/api/auth/admin/login', {
      email: authorizedAdminEmail,
      password: 'WrongPassword999!',
    });
    console.log(`  -> Status: ${test2.status}, Message: "${test2.data?.message}"`);
    if (test2.status === 401 && test2.data?.success === false) {
      console.log('  [PASS] Incorrect password was strictly rejected with 401.\n');
    } else {
      throw new Error(`TEST 2 FAILED: Expected 401, got ${test2.status}`);
    }

    // TEST 3: Authorized Admin Email with Correct Password
    console.log(`[TEST 3] Attempting admin login with authorized email ("${authorizedAdminEmail}") and CORRECT password...`);
    const test3 = await makeRequest('POST', '/api/auth/admin/login', {
      email: authorizedAdminEmail,
      password: validPassword,
    });
    console.log(`  -> Status: ${test3.status}, Success: ${test3.data?.success}`);
    if (test3.status === 200 && test3.data?.data?.accessToken) {
      console.log(`  [PASS] Authorized administrator authenticated successfully. Role: ${test3.data.data.user.role}\n`);
    } else {
      throw new Error(`TEST 3 FAILED: Expected 200, got ${test3.status} (${JSON.stringify(test3.data)})`);
    }

    const adminToken = test3.data.data.accessToken;

    // TEST 4: Access Protected Admin API using Valid Admin Token
    console.log('[TEST 4] Calling protected admin API (GET /api/admin/dashboard/stats) with Admin Token...');
    const test4 = await makeRequest('GET', '/api/admin/dashboard/stats', null, {
      Authorization: `Bearer ${adminToken}`,
    });
    console.log(`  -> Status: ${test4.status}, Success: ${test4.data?.success}`);
    if (test4.status === 200 && test4.data?.success) {
      console.log('  [PASS] Protected Admin API responded with 200 OK for authorized admin.\n');
    } else {
      throw new Error(`TEST 4 FAILED: Expected 200, got ${test4.status}`);
    }

    // TEST 5: Direct Admin API Access WITHOUT Token
    console.log('[TEST 5] Calling protected admin API (GET /api/admin/dashboard/stats) with NO token...');
    const test5 = await makeRequest('GET', '/api/admin/dashboard/stats');
    console.log(`  -> Status: ${test5.status}, Message: "${test5.data?.message}"`);
    if (test5.status === 401) {
      console.log('  [PASS] Unauthenticated access blocked with 401.\n');
    } else {
      throw new Error(`TEST 5 FAILED: Expected 401, got ${test5.status}`);
    }

    // TEST 6: Customer User attempting to access Admin API
    console.log('[TEST 6] Customer user attempting to access Admin API...');
    const customerLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'rahul.sharma@example.com',
      password: 'Customer@Password123',
    });
    const customerToken = customerLogin.data?.data?.accessToken;

    const test6 = await makeRequest('GET', '/api/admin/dashboard/stats', null, {
      Authorization: `Bearer ${customerToken}`,
    });
    console.log(`  -> Status: ${test6.status}, Message: "${test6.data?.message}"`);
    if (test6.status === 403) {
      console.log('  [PASS] Normal customer strictly blocked from Admin API with 403 Forbidden.\n');
    } else {
      throw new Error(`TEST 6 FAILED: Expected 403, got ${test6.status}`);
    }

    // TEST 7: Prevent Public Registration with Authorized Admin Email
    console.log(`[TEST 7] Attempting public registration with admin email ("${authorizedAdminEmail}")...`);
    const test7 = await makeRequest('POST', '/api/auth/register', {
      name: 'Rogue Impersonator',
      email: authorizedAdminEmail,
      mobile: '9123456789',
      password: 'AttackerPassword123!',
    });
    console.log(`  -> Status: ${test7.status}, Message: "${test7.data?.message}"`);
    if (test7.status === 409) {
      console.log('  [PASS] Registration with admin email blocked with 409 Conflict.\n');
    } else {
      throw new Error(`TEST 7 FAILED: Expected 409, got ${test7.status}`);
    }

    // TEST 8: Forgot Password safety for Admin Email
    console.log(`[TEST 8] Requesting forgot-password for admin email ("${authorizedAdminEmail}")...`);
    const test8 = await makeRequest('POST', '/api/auth/forgot-password', {
      email: authorizedAdminEmail,
    });
    console.log(`  -> Status: ${test8.status}, Has devResetToken: ${Boolean(test8.data?.devResetToken)}`);
    const adminInDb = await User.findOne({ email: authorizedAdminEmail }).select('+resetPasswordToken');
    if (!adminInDb.resetPasswordToken && !test8.data?.devResetToken) {
      console.log('  [PASS] Public forgot-password endpoint does NOT create reset token on admin account.\n');
    } else {
      throw new Error(`TEST 8 FAILED: Admin account password reset token was set!`);
    }

    console.log('======================================================================');
    console.log('ALL 8 END-TO-END SECURITY VERIFICATION TESTS PASSED SUCCESSFULLY!');
    console.log('======================================================================');
    process.exit(0);
  } catch (err) {
    console.error('VERIFICATION ERROR:', err.message);
    process.exit(1);
  }
};

runVerification();


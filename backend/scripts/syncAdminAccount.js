require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const User = require('../models/User');

const syncAdminAccount = async () => {
  const targetEmail = (process.env.ADMIN_EMAIL || 'historypackersandmovers@gmail.com').toLowerCase().trim();

  if (!targetEmail.endsWith('@gmail.com')) {
    console.error(`[Admin Audit] Error: ADMIN_EMAIL must be a Gmail address (ends with @gmail.com). Got: "${targetEmail}"`);
    process.exit(1);
  }

  try {
    console.log('[Admin Audit] Connecting to MongoDB...');
    await connectDB();

    const allAdmins = await User.find({ role: 'admin' }).select('+password');
    console.log(`[Admin Audit] Found ${allAdmins.length} administrator account(s) in database.`);

    if (allAdmins.length > 1) {
      console.warn(`[SECURITY WARNING] Multiple administrator accounts detected (${allAdmins.length}):`);
      allAdmins.forEach((a, idx) => {
        console.warn(`  ${idx + 1}. ID: ${a._id}, Email: ${a.email}, Name: ${a.name}, Status: ${a.status}`);
      });
      console.warn(`[REMEDIATION PLAN] Retain only the authorized account ("${targetEmail}") and demote or archive redundant accounts. No accounts will be deleted automatically.`);
    }

    let authorizedAdmin = await User.findOne({ email: targetEmail, role: 'admin' }).select('+password');

    if (!authorizedAdmin && allAdmins.length > 0) {
      // Migrate the primary admin account to target Gmail address without resetting its password hash
      const primaryAdmin = allAdmins[0];
      const oldEmail = primaryAdmin.email;
      console.log(`[Admin Audit] Migrating primary admin email from "${oldEmail}" to authorized Gmail "${targetEmail}"...`);

      await User.updateOne({ _id: primaryAdmin._id }, { $set: { email: targetEmail, status: 'active' } });
      authorizedAdmin = await User.findById(primaryAdmin._id).select('+password');
      console.log(`[Admin Audit] Successfully migrated admin account. Password hash preserved.`);
    } else if (!authorizedAdmin) {
      console.warn(`[Admin Audit] No administrator account found. Run 'npm run seed:admin' to provision the initial administrator.`);
    }

    if (authorizedAdmin) {
      console.log('----------------------------------------------------');
      console.log(`  Authorized Admin Account: ${authorizedAdmin.email}`);
      console.log(`  Role:                     ${authorizedAdmin.role}`);
      console.log(`  Status:                   ${authorizedAdmin.status}`);
      console.log(`  ID:                       ${authorizedAdmin._id}`);
      
      const passwordTest = await authorizedAdmin.comparePassword('Admin@Password123');
      console.log(`  Existing Password Match:  ${passwordTest ? 'VERIFIED' : 'CUSTOM PASSWORD CONFIGURED'}`);
      console.log('----------------------------------------------------');
    }

    process.exit(0);
  } catch (err) {
    console.error('[Admin Audit Error]', err.message);
    process.exit(1);
  }
};

syncAdminAccount();


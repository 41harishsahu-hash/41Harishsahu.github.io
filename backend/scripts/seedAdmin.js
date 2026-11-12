require('dotenv').config();
const { connectDB } = require('../config/db');
const User = require('../models/User');

const provisionAdmin = async () => {
  const args = process.argv.slice(2);
  const email = (args[0] || process.env.ADMIN_EMAIL || 'historypackersandmovers@gmail.com').toLowerCase().trim();
  const password = args[1] || process.env.ADMIN_INITIAL_PASSWORD;
  const name = args[2] || 'System Administrator';
  const mobile = args[3] || '9251273070';

  if (!email.endsWith('@gmail.com')) {
    console.error(`[Admin Provisioning Error] Authorized admin email must be a Gmail address (@gmail.com). Got: "${email}"`);
    process.exit(1);
  }

  try {
    console.log(`[Admin Provisioning] Connecting to MongoDB...`);
    await connectDB();

    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log(`[Admin Provisioning] Administrator with email ${email} already exists.`);
      existingAdmin.name = name;
      existingAdmin.mobile = mobile;
      existingAdmin.role = 'admin';
      existingAdmin.status = 'active';
      if (password) {
        existingAdmin.password = password;
        console.log(`[Admin Provisioning] Password updated with provided credential.`);
      } else {
        console.log(`[Admin Provisioning] Preserved existing password hash.`);
      }
      await existingAdmin.save();
    } else {
      if (!password) {
        console.error(`[Admin Provisioning Error] Password is required to create a new administrator account.`);
        process.exit(1);
      }
      await User.create({
        name,
        email,
        mobile,
        password,
        role: 'admin',
        status: 'active',
      });
      console.log(`[Admin Provisioning] New administrator account created successfully!`);
    }

    console.log(`-----------------------------------------------------`);
    console.log(`  Admin Email:    ${email}`);
    console.log(`  Admin Account Provisioned Successfully`);
    console.log(`-----------------------------------------------------`);
    process.exit(0);
  } catch (err) {
    console.error(`[Admin Provisioning Error]`, err.message);
    process.exit(1);
  }
};

provisionAdmin();


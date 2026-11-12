const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async (uriOverride = null) => {
  const uri = uriOverride || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/history_packers';
  
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    isConnected = false;
    console.error(`[MongoDB] Connection error: ${err.message}`);
    console.warn(`[MongoDB] Please verify MONGODB_URI in backend/.env if live database access is needed.`);
    throw err;
  }
};

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('[MongoDB] Disconnected from database.');
});

mongoose.connection.on('reconnected', () => {
  isConnected = true;
  console.log('[MongoDB] Reconnected to database.');
});

module.exports = {
  connectDB,
  isConnected: () => isConnected || mongoose.connection.readyState === 1,
};


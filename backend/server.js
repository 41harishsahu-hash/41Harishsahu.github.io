const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const app = require('./app');
const { connectDB, isConnected } = require('./config/db');
const { autoBootstrapDatabase } = require('./config/autoBootstrap');
const { validateCloudinaryOnStartup } = require('./config/cloudinary');

const PORT = process.env.PORT || 5000;

let server;

const startServer = async () => {
  try {
    // Attempt DB connection
    await connectDB().catch((err) => {
      console.warn(`[Warning] Database initial connection failed: ${err.message}. Server will continue running.`);
    });

    // Auto-bootstrap administrator and essential content safely
    if (isConnected()) {
      await autoBootstrapDatabase().catch((err) => {
        console.warn(`[Auto-Bootstrap Warning] Non-fatal initialization warning: ${err.message}`);
      });
    }

    // Validate Cloudinary environment configuration
    validateCloudinaryOnStartup();

    server = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`  History Packers & Movers - Backend API Server`);
      console.log(`  Running on: http://localhost:${PORT}`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error(`Failed to launch server: ${err.message}`);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown handling
const handleShutdown = (signal) => {
  console.log(`[Server] Received ${signal}. Shutting down gracefully...`);
  if (server) {
    server.close(() => {
      console.log('[Server] HTTP connections closed.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('[Unhandled Rejection]', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]', err);
  process.exit(1);
});


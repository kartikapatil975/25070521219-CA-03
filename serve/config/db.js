const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/readsphere';

let isConnected = false;
let retryTimer = null;

/**
 * Connect to Local MongoDB Community Server with automatic reconnect retry
 */
const connectDB = async () => {
  // If already connected
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return mongoose.connection;
  }

  // If connection is already in progress, avoid duplicate connection calls
  if (mongoose.connection.readyState === 2) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 4000, // Fail fast if local MongoDB is not running
    });

    isConnected = true;
    if (retryTimer) {
      clearTimeout(retryTimer);
      retryTimer = null;
    }

    console.log(`\n==================================================`);
    console.log(`[MongoDB] Successfully connected to Local MongoDB Server!`);
    console.log(`Host:     ${conn.connection.host}:${conn.connection.port}`);
    console.log(`Database: ${conn.connection.name}`);
    console.log(`Compass:  Connect to mongodb://127.0.0.1:27017 to inspect '${conn.connection.name}'`);
    console.log(`==================================================\n`);
    return conn;
  } catch (error) {
    isConnected = false;
    console.error(`\n****************************************************************`);
    console.error(`[DATABASE ERROR] Failed to connect to local MongoDB Server!`);
    console.error(`Attempted URI: ${MONGODB_URI}`);
    console.error(`Reason: ${error.message}`);
    console.error(`----------------------------------------------------------------`);
    console.error(`TROUBLESHOOTING INSTRUCTIONS:`);
    console.error(`1. Ensure local MongoDB Community Server is installed & running.`);
    console.error(`   - On macOS with Homebrew:`);
    console.error(`     brew services start mongodb-community`);
    console.error(`   - Or start manually:`);
    console.error(`     mongod --dbpath ~/data/db`);
    console.error(`2. Open MongoDB Compass and verify you can connect using:`);
    console.error(`     mongodb://127.0.0.1:27017`);
    console.error(`3. Confirm the port 27017 is not blocked by a local firewall.`);
    console.error(`4. Check that database name 'readsphere' can be written to.`);
    console.error(`****************************************************************\n`);

    // Schedule background retry after 5 seconds if not yet connected
    if (!retryTimer) {
      retryTimer = setTimeout(() => {
        retryTimer = null;
        if (!isDbConnected()) {
          console.log('[MongoDB] Retrying connection to local MongoDB Server...');
          connectDB();
        }
      }, 5000);
    }
  }
};

// Monitor connection events
mongoose.connection.on('connected', () => {
  isConnected = true;
  console.log('[MongoDB] Connection event: CONNECTED');
});

mongoose.connection.on('error', (err) => {
  isConnected = false;
  console.error('[MongoDB] Connection event: ERROR -', err.message);
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('[MongoDB] Connection event: DISCONNECTED');
});

/**
 * Helper to check connection status
 */
const isDbConnected = () => {
  return mongoose.connection.readyState === 1;
};

/**
 * Get detailed database diagnostics
 */
const getDbStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return {
    state: states[mongoose.connection.readyState] || 'unknown',
    readyState: mongoose.connection.readyState,
    isConnected: mongoose.connection.readyState === 1,
    host: mongoose.connection.host || '127.0.0.1',
    port: mongoose.connection.port || 27017,
    name: mongoose.connection.name || 'readsphere',
    uri: MONGODB_URI,
  };
};

module.exports = {
  connectDB,
  isDbConnected,
  getDbStatus,
};

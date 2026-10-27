const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { getDbStatus, isDbConnected, connectDB } = require('../config/db');
const Book = require('../models/Book');
const ReadingSession = require('../models/ReadingSession');
const ReadingGoal = require('../models/ReadingGoal');

/**
 * @desc    Health check & database connection diagnostics
 * @route   GET /api/health
 */
router.get('/health', async (req, res) => {
  let connected = isDbConnected();

  // If currently not connected, attempt a quick connection attempt
  if (!connected) {
    try {
      await connectDB();
      connected = isDbConnected();
    } catch (e) {
      // Handled by db.js
    }
  }

  const dbStatus = getDbStatus();

  let collections = {
    books: 0,
    readingsessions: 0,
    readinggoals: 0,
  };

  if (connected) {
    try {
      const [bookCount, sessionCount, goalCount] = await Promise.all([
        Book.countDocuments(),
        ReadingSession.countDocuments(),
        ReadingGoal.countDocuments(),
      ]);
      collections = {
        books: bookCount,
        readingsessions: sessionCount,
        readinggoals: goalCount,
      };
    } catch (e) {
      console.error('[Health] Failed to count documents:', e.message);
    }
  }

  const responsePayload = {
    status: connected ? 'healthy' : 'database_unavailable',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    database: {
      type: 'Local MongoDB Community Server (Localhost)',
      connectionString: dbStatus.uri,
      status: dbStatus.state,
      connected: dbStatus.isConnected,
      databaseName: dbStatus.name,
      host: dbStatus.host,
      port: dbStatus.port,
      compassInstructions: 'Open MongoDB Compass and connect to: mongodb://127.0.0.1:27017',
      collections,
    },
  };

  if (!connected) {
    responsePayload.troubleshooting = {
      message: 'MongoDB Community Server is not running on 127.0.0.1:27017.',
      steps: [
        '1. Open Terminal and run: brew services start mongodb-community (or mongod --dbpath ~/data/db)',
        '2. Open MongoDB Compass and verify connection to mongodb://127.0.0.1:27017',
        '3. Ensure readsphere database is accessible',
      ],
    };
    return res.status(503).json(responsePayload);
  }

  return res.status(200).json(responsePayload);
});

module.exports = router;

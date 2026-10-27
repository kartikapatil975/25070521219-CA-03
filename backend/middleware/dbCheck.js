const { isDbConnected, getDbStatus } = require('../config/db');

/**
 * Middleware to ensure MongoDB is connected before running database queries.
 * Prevents requests from hanging indefinitely or failing silently when local MongoDB is down.
 */
const requireDatabase = (req, res, next) => {
  if (!isDbConnected()) {
    const status = getDbStatus();
    return res.status(503).json({
      success: false,
      error: 'Database Unavailable',
      message: 'Local MongoDB Community Server is not connected at mongodb://127.0.0.1:27017/readsphere.',
      databaseStatus: status.state,
      troubleshooting: [
        '1. Verify MongoDB Community Server is installed locally (not Atlas).',
        '2. Start MongoDB locally: run "brew services start mongodb-community" or "mongod".',
        '3. Test local connection using MongoDB Compass at "mongodb://127.0.0.1:27017".',
        '4. Ensure the database name is "readsphere".',
      ],
    });
  }
  next();
};

module.exports = {
  requireDatabase,
};


const express = require('express');
const router = express.Router();
const {
  getDashboardData,
  getAnalyticsData,
} = require('../controllers/dashboardController');
const { requireDatabase } = require('../middleware/dbCheck');

// Dashboard and analytics routes require database connection
router.use(requireDatabase);

router.get('/dashboard', getDashboardData);
router.get('/analytics', getAnalyticsData);

module.exports = router;


const express = require('express');
const {
  getMonthlyStats,
  getYearlyStats,
  getCategoryDistribution,
  getSpendingTrends
} = require('../controllers/statisticsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes
router.get('/monthly', getMonthlyStats);
router.get('/yearly', getYearlyStats);
router.get('/categories', getCategoryDistribution);
router.get('/trends', getSpendingTrends);

module.exports = router;

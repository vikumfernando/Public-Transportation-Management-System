const express = require('express');
const router = express.Router();
const revenueController = require('../controllers/revenueController');

// All revenue routes require authentication
router.use(auth);

// Revenue routes
router.get('/stats', revenueController.getRevenueStats);
router.get('/date-range', revenueController.getRevenueByDateRange);
router.get('/cards-count', revenueController.getActiveCardsCount);

module.exports = router;
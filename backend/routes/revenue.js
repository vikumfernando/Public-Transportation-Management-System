const express = require('express');
const router = express.Router();
const revenueController = require('../controllers/revenueController');
const Transaction = require('../models/Transaction');

// Revenue routes
router.get('/stats', revenueController.getRevenueStats);
router.get('/date-range', revenueController.getRevenueByDateRange);
router.get('/cards-count', revenueController.getActiveCardsCount);

// Frontend expects:
// GET /api/revenue/route/:routeId?period=...
router.get('/route/:routeId', async (req, res) => {
  try {
    const { routeId } = req.params;
    const { period = 'daily' } = req.query;
    const match = { routeId };
    const total = await Transaction.aggregate([
      { $match: match },
      { $group: { _id: null, sum: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);
    res.json({
      routeId,
      period,
      totalAmount: total[0]?.sum || 0,
      count: total[0]?.count || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/revenue/overall?period=...
router.get('/overall', async (req, res) => {
  try {
    const { period = 'daily' } = req.query;
    const total = await Transaction.aggregate([
      { $group: { _id: null, sum: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);
    res.json({
      period,
      totalAmount: total[0]?.sum || 0,
      count: total[0]?.count || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
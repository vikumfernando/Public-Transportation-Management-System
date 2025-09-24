const Transaction = require('../models/Transaction');
const Payment = require('../models/Payment');
const SmartCard = require('../models/SmartCard');

// Get revenue statistics
const getRevenueStats = async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case '7d':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
        break;
      case '30d':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
        break;
      case '90d':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) } };
        break;
      case '1y':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) } };
        break;
    }

    // Get fare revenue from transactions
    const fareRevenue = await Transaction.aggregate([
      { $match: { type: 'fare', status: 'paid', ...dateFilter } },
      {
        $group: {
          _id: null,
          totalFareRevenue: { $sum: '$amountCents' },
          totalFareTransactions: { $sum: 1 }
        }
      }
    ]);

    // Get top-up revenue from transactions
    const topupRevenue = await Transaction.aggregate([
      { $match: { type: 'topup', status: 'paid', ...dateFilter } },
      {
        $group: {
          _id: null,
          totalTopupRevenue: { $sum: '$amountCents' },
          totalTopupTransactions: { $sum: 1 }
        }
      }
    ]);

    // Get payment gateway revenue
    const paymentRevenue = await Payment.aggregate([
      { $match: { status: 'completed', ...dateFilter } },
      {
        $group: {
          _id: null,
          totalPaymentRevenue: { $sum: '$amount' },
          totalPayments: { $sum: 1 }
        }
      }
    ]);

    // Get daily revenue breakdown
    const dailyRevenue = await Transaction.aggregate([
      { $match: { type: 'fare', status: 'paid', ...dateFilter } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          dailyRevenue: { $sum: '$amountCents' },
          dailyTransactions: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Get route-wise revenue (if busId is available)
    const routeRevenue = await Transaction.aggregate([
      { $match: { type: 'fare', status: 'paid', busId: { $exists: true }, ...dateFilter } },
      {
        $group: {
          _id: '$busId',
          routeRevenue: { $sum: '$amountCents' },
          routeTransactions: { $sum: 1 }
        }
      },
      { $sort: { routeRevenue: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      period,
      revenue: {
        totalFareRevenue: fareRevenue[0]?.totalFareRevenue || 0,
        totalTopupRevenue: topupRevenue[0]?.totalTopupRevenue || 0,
        totalPaymentRevenue: (paymentRevenue[0]?.totalPaymentRevenue || 0) * 100, // Convert to cents
        netRevenue: (fareRevenue[0]?.totalFareRevenue || 0) + (topupRevenue[0]?.totalTopupRevenue || 0)
      },
      transactions: {
        totalFareTransactions: fareRevenue[0]?.totalFareTransactions || 0,
        totalTopupTransactions: topupRevenue[0]?.totalTopupTransactions || 0,
        totalPayments: paymentRevenue[0]?.totalPayments || 0
      },
      dailyBreakdown: dailyRevenue,
      topRoutes: routeRevenue
    });
  } catch (error) {
    console.error('Get revenue stats error:', error);
    res.status(500).json({ message: 'Server error fetching revenue stats' });
  }
};

// Get revenue by date range
const getRevenueByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const dateFilter = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    const revenue = await Transaction.aggregate([
      { $match: { type: 'fare', status: 'paid', ...dateFilter } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amountCents' },
          totalTransactions: { $sum: 1 },
          avgTransactionAmount: { $avg: '$amountCents' }
        }
      }
    ]);

    const dailyBreakdown = await Transaction.aggregate([
      { $match: { type: 'fare', status: 'paid', ...dateFilter } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          dailyRevenue: { $sum: '$amountCents' },
          dailyTransactions: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    res.json({
      dateRange: { startDate, endDate },
      revenue: revenue[0] || {
        totalRevenue: 0,
        totalTransactions: 0,
        avgTransactionAmount: 0
      },
      dailyBreakdown
    });
  } catch (error) {
    console.error('Get revenue by date range error:', error);
    res.status(500).json({ message: 'Server error fetching revenue by date range' });
  }
};

// Get active cards count
const getActiveCardsCount = async (req, res) => {
  try {
    const activeCardsCount = await SmartCard.countDocuments({ status: 'active' });
    const totalCardsCount = await SmartCard.countDocuments();
    const blockedCardsCount = await SmartCard.countDocuments({ status: 'blocked' });

    res.json({
      activeCards: activeCardsCount,
      totalCards: totalCardsCount,
      blockedCards: blockedCardsCount
    });
  } catch (error) {
    console.error('Get active cards count error:', error);
    res.status(500).json({ message: 'Server error fetching active cards count' });
  }
};

module.exports = {
  getRevenueStats,
  getRevenueByDateRange,
  getActiveCardsCount
};

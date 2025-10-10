const Transaction = require('../models/Transaction');
const SmartCard = require('../models/SmartCard');
const User = require('../models/User');
// 
const { computeFareCents } = require('../utils/fareCalculator');

// Get user transactions
const getUserTransactions = async (req, res) => {
  try {
    // No authentication - return all transactions for demo
    const { page = 1, limit = 20, type } = req.query;

    let query = {};
    if (type) {
      query.type = type;
    }

    const transactions = await Transaction.find(query)
      .populate('card', 'cardId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(query);

    res.json({
      transactions: transactions.map(transaction => ({
        id: transaction._id,
        type: transaction.type,
        amountCents: transaction.amountCents,
        distanceMeters: transaction.distanceMeters,
        startStopId: transaction.startStopId,
        endStopId: transaction.endStopId,
        status: transaction.status,
        paymentMethod: transaction.paymentMethod,
        busId: transaction.busId,
        createdAt: transaction.createdAt,
        cardId: transaction.card?.cardId
      })),
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error fetching transactions' });
  }
};

// Create transaction (for bus tap)
const createTransaction = async (req, res) => {
  try {
    const { cardId, type, amountCents, busId, startStopId, endStopId, distanceMeters } = req.body;
    // No authentication - use demo user ID
    const userId = "507f1f77bcf86cd799439011";

    // Find card
    const card = await SmartCard.findOne({ cardId });
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    if (card.status !== 'active') {
      return res.status(400).json({ message: 'Card is not active' });
    }

    // Check balance for fare transactions
    if (type === 'fare' && card.balanceCents < amountCents) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Create transaction
    const transaction = new Transaction({
      user: userId,
      card: card._id,
      type,
      amountCents: amountCents || 0,
      distanceMeters,
      startStopId,
      endStopId,
      status: type === 'fare' ? 'paid' : 'pending',
      paymentMethod: type === 'fare' ? 'balance' : 'none',
      busId
    });

    await transaction.save();

    // Update card balance and last tap time for fare transactions
    if (type === 'fare') {
      card.balanceCents -= amountCents;
      card.lastTapAt = new Date();
      await card.save();
    }

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction: {
        id: transaction._id,
        type: transaction.type,
        amountCents: transaction.amountCents,
        status: transaction.status,
        createdAt: transaction.createdAt
      }
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Server error creating transaction' });
  }
};

// Get transaction by ID
const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    // No authentication - return transaction without user check
    const transaction = await Transaction.findOne({ _id: id })
      .populate('card', 'cardId');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({
      transaction: {
        id: transaction._id,
        type: transaction.type,
        amountCents: transaction.amountCents,
        distanceMeters: transaction.distanceMeters,
        startStopId: transaction.startStopId,
        endStopId: transaction.endStopId,
        status: transaction.status,
        paymentMethod: transaction.paymentMethod,
        busId: transaction.busId,
        createdAt: transaction.createdAt,
        cardId: transaction.card?.cardId
      }
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ message: 'Server error fetching transaction' });
  }
};

// Get transaction statistics
const getTransactionStats = async (req, res) => {
  try {
    // No authentication - return stats for all transactions
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
    }

    const stats = await Transaction.aggregate([
      { $match: { ...dateFilter } },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalSpent: { $sum: { $cond: [{ $eq: ['$type', 'fare'] }, '$amountCents', 0] } },
          totalTopups: { $sum: { $cond: [{ $eq: ['$type', 'topup'] }, '$amountCents', 0] } },
          avgTransactionAmount: { $avg: '$amountCents' }
        }
      }
    ]);

    const typeStats = await Transaction.aggregate([
      { $match: { user: userId, ...dateFilter } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amountCents' }
        }
      }
    ]);

    res.json({
      period,
      stats: stats[0] || {
        totalTransactions: 0,
        totalSpent: 0,
        totalTopups: 0,
        avgTransactionAmount: 0
      },
      typeBreakdown: typeStats
    });
  } catch (error) {
    console.error('Get transaction stats error:', error);
    res.status(500).json({ message: 'Server error fetching transaction stats' });
  }
};

// NFC Tap In/Out functionality
const handleNFCTap = async (req, res) => {
  try {
    const { cardId, busId, stopId, action } = req.body; // action: 'tap-in' or 'tap-out'

    // Find card
    const card = await SmartCard.findOne({ cardId });
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    if (card.status !== 'active') {
      return res.status(400).json({ message: 'Card is not active' });
    }

    // Find user
    const user = await User.findById(card.owner);
    if (!user) {
      return res.status(404).json({ message: 'Card owner not found' });
    }

    let transaction = null;

    if (action === 'tap-in') {
      // Create tap-in transaction
      transaction = new Transaction({
        user: card.owner,
        card: card._id,
        type: 'tap-in',
        amountCents: 0,
        startStopId: stopId,
        status: 'pending',
        paymentMethod: 'balance',
        busId
      });
      await transaction.save();

      // Update card last tap time
      card.lastTapAt = new Date();
      await card.save();

      res.json({
        message: 'Tap-in successful',
        transaction: {
          id: transaction._id,
          type: 'tap-in',
          stopId,
          busId,
          timestamp: transaction.createdAt
        }
      });

    } else if (action === 'tap-out') {
      // Find the most recent tap-in transaction for this card
      const lastTapIn = await Transaction.findOne({
        card: card._id,
        type: 'tap-in',
        status: 'pending'
      }).sort({ createdAt: -1 });

      if (!lastTapIn) {
        return res.status(400).json({ message: 'No tap-in found for this card' });
      }

      // Calculate fare based on distance (simplified calculation)
      const distanceMeters = 5000; // This should be calculated based on actual distance
      const fareRule = {
        baseFareCents: 500, // LKR 5.00 base fare
        perKmCents: 100,    // LKR 1.00 per km
        maxFareCents: 2000  // LKR 20.00 maximum fare
      };
      
      const fareCents = computeFareCents(distanceMeters, fareRule);

      // Check balance
      if (card.balanceCents < fareCents) {
        return res.status(400). json({
          message: 'Insufficient balance',
          requiredAmount: fareCents,
          currentBalance: card.balanceCents
        });
      }

      // Create tap-out transaction with fare
      transaction = new Transaction({
        user: card.owner,
        card: card._id,
        type: 'tap-out',
        amountCents: fareCents,
        distanceMeters,
        startStopId: lastTapIn.startStopId,
        endStopId: stopId,
        status: 'paid',
        paymentMethod: 'balance',
        busId
      });
      await transaction.save();

      // Update card balance
      card.balanceCents -= fareCents;
      card.lastTapAt = new Date();
      await card.save();

      // Mark tap-in as completed
      lastTapIn.status = 'paid';
      await lastTapIn.save();

      // Send digital receipt
      try {
        const receiptHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Transit Receipt</h2>
            <div style="border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px;">
              <p><strong>Card ID:</strong> ${cardId}</p>
              <p><strong>Journey:</strong> ${lastTapIn.startStopId} → ${stopId}</p>
              <p><strong>Distance:</strong> ${(distanceMeters/1000).toFixed(1)} km</p>
              <p><strong>Fare:</strong> LKR ${(fareCents/100).toFixed(2)}</p>
              <p><strong>Remaining Balance:</strong> LKR ${(card.balanceCents/100).toFixed(2)}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
          </div>
        `;
        
        // Email functionality removed - receipts available via PDF download
      } catch (emailError) {
        console.error('Email functionality removed:', emailError);
        // Email functionality removed - system works without email
      }

      res.json({
        message: 'Tap-out successful',
        transaction: {
          id: transaction._id,
          type: 'tap-out',
          fare: fareCents,
          remainingBalance: card.balanceCents,
          startStop: lastTapIn.startStopId,
          endStop: stopId,
          timestamp: transaction.createdAt
        }
      });
    } else {
      return res.status(400).json({ message: 'Invalid action. Must be "tap-in" or "tap-out"' });
    }

  } catch (error) {
    console.error('NFC tap error:', error);
    res.status(500).json({ message: 'Server error processing NFC tap' });
  }
};

module.exports = {
  getUserTransactions,
  createTransaction,
  getTransactionById,
  getTransactionStats,
  handleNFCTap
};

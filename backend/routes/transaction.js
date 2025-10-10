const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const SmartCard = require('../models/SmartCard');
const VisaCard = require('../models/VisaCard');
const Transaction = require('../models/Transaction');

// Transaction routes
router.get('/', transactionController.getUserTransactions);
router.post('/', transactionController.createTransaction);
router.post('/nfc-tap', transactionController.handleNFCTap);
router.get('/stats', transactionController.getTransactionStats);
router.get('/by-id/:id', transactionController.getTransactionById);


// Top up card
router.post("/topup", async (req, res) => {
  try {
    const { cardNumber, amount, userId } = req.body;
    
    let card, cardType;
    if (cardNumber.length > 12) {
      cardType = 'Visa';
      card = await VisaCard.findOne({ cardNumber, isActive: true });
    } else {
      cardType = 'NFC';
      card = await SmartCard.findOne({ cardNumber, isActive: true });
    }
    
    if (!card) {
      return res.status(404).json({ error: "Card not found" });
    }
    
    card.balance += amount;
    await card.save();
    
    const transaction = new Transaction({
      userId,
      cardNumber,
      cardType,
      amount,
      transactionType: 'topup'
    });
    
    await transaction.save();
    
    res.json({ success: true, newBalance: card.balance, transaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Refunds API
router.post("/refunds", async (req, res) => {
  try {
    const { transactionId, amount, reason } = req.body;
    
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    
    let card;
    if (transaction.cardType === 'Visa') {
      card = await VisaCard.findOne({ cardNumber: transaction.cardNumber });
    } else {
      card = await SmartCard.findOne({ cardNumber: transaction.cardNumber });
    }
    
    if (card) {
      card.balance += amount;
      await card.save();
    }
    
    const refundTransaction = new Transaction({
      userId: transaction.userId,
      cardNumber: transaction.cardNumber,
      cardType: transaction.cardType,
      amount,
      transactionType: 'refund',
      status: 'completed'
    });
    
    await refundTransaction.save();
    
    res.json({ success: true, refundTransaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create transaction record
router.post("/create", async (req, res) => {
  try {
    const { 
      cardNumber, 
      amount, 
      transactionType, 
      status, 
      paymentMethod, 
      sourceCard,
      fromLocation,
      toLocation,
      distance
    } = req.body;
    
    console.log('📝 Recording transaction:', {
      cardNumber,
      amount,
      transactionType,
      fromLocation,
      toLocation,
      distance
    });
    
    const transaction = new Transaction({
      userId: "507f1f77bcf86cd799439011",
      cardNumber,
      amount,
      transactionType,
      status,
      paymentMethod,
      sourceCard,
      fromLocation,
      toLocation,
      distance,
      timestamp: new Date()
    });
    
    await transaction.save();
    console.log('✅ Transaction saved with ID:', transaction._id);
    
    res.json({
      success: true,
      transaction: transaction,
      message: 'Transaction recorded successfully'
    });
  } catch (error) {
    console.error('❌ Create transaction error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Additional route for filtered transaction history (as per scaffold requirements)
router.get('/history', async (req, res) => {
  try {
    const { userId, cardId, limit = 20, skip = 0 } = req.query;
    const requestingUserId = req.user.userId;

    // Build query
    let query = {};
    
    // If userId is provided, verify it matches the requesting user (for security)
    if (userId && userId !== requestingUserId.toString()) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'You can only view your own transactions' 
      });
    }
    
    query.user = requestingUserId;
    
    if (cardId) {
      // Find card and verify ownership
      const SmartCard = require('../models/SmartCard');
      const card = await SmartCard.findOne({ cardId, owner: requestingUserId });
      if (card) {
        query.card = card._id;
      } else {
        return res.status(404).json({ 
          error: 'Card not found',
          message: 'Card not found or not owned by user' 
        });
      }
    }

    const Transaction = require('../models/Transaction');
    const transactions = await Transaction.find(query)
      .populate('card', 'cardId')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Transaction.countDocuments(query);

    res.json({
      transactions: transactions.map(t => ({
        id: t._id,
        type: t.type,
        amountCents: t.amountCents,
        distanceMeters: t.distanceMeters,
        startStopId: t.startStopId,
        endStopId: t.endStopId,
        status: t.status,
        paymentMethod: t.paymentMethod,
        busId: t.busId,
        createdAt: t.createdAt,
        cardId: t.card?.cardId
      })),
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: (parseInt(skip) + parseInt(limit)) < total
      }
    });
  } catch (error) {
    console.error('Get transaction history error:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to fetch transaction history' 
    });
  }
});

// Get user transactions (frontend expects array of raw transactions)
// Place after specific routes to avoid shadowing
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const query = (userId === '507f1f77bcf86cd799439011') ? {} : { userId };
    const transactions = await Transaction.find(query)
      .sort({ timestamp: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

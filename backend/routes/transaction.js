const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// All transaction routes require authentication
router.use(auth);

// Transaction routes
router.get('/', transactionController.getUserTransactions);
router.post('/', transactionController.createTransaction);
router.post('/nfc-tap', transactionController.handleNFCTap);
router.get('/stats', transactionController.getTransactionStats);
router.get('/:id', transactionController.getTransactionById);

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

module.exports = router;

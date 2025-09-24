const SmartCard = require('../models/SmartCard');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const PaymentMethod = require('../models/PaymentMethod');
const FareRule = require('../models/FareRule');
const { computeFareCents } = require('../utils/fareCalculator');

// Create new NFC smart card
const createCard = async (req, res) => {
  try {
    const { cardId, ownerName } = req.body;
    const userId = req.user.userId;

    // Check if card already exists
    const existingCard = await SmartCard.findOne({ cardId });
    if (existingCard) {
      return res.status(400).json({ message: 'NFC Card already exists' });
    }

    // Create new NFC card
    const card = new SmartCard({
      cardId: cardId || `NFC_${Date.now()}`, // Generate ID if not provided
      owner: userId,
      balanceCents: 0,
      status: 'active'
    });

    await card.save();

    // Add card to user
    await User.findByIdAndUpdate(userId, {
      $push: { cards: card._id }
    });

    res.status(201).json({
      message: 'NFC Card created successfully',
      card: {
        id: card._id,
        cardId: card.cardId,
        balanceCents: card.balanceCents,
        status: card.status,
        ownerName: ownerName || 'Demo User'
      }
    });
  } catch (error) {
    console.error('Create card error:', error);
    res.status(500).json({ message: 'Server error creating card' });
  }
};

// Get user's cards
const getUserCards = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const cards = await SmartCard.find({ owner: userId });
    
    res.json({
      cards: cards.map(card => ({
        id: card._id,
        cardId: card.cardId,
        balanceCents: card.balanceCents,
        status: card.status,
        issuedAt: card.issuedAt,
        lastTapAt: card.lastTapAt
      }))
    });
  } catch (error) {
    console.error('Get cards error:', error);
    res.status(500).json({ message: 'Server error fetching cards' });
  }
};

// Get card balance
const getCardBalance = async (req, res) => {
  try {
    const { cardId } = req.params;
    
    const card = await SmartCard.findOne({ cardId });
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    res.json({
      cardId: card.cardId,
      balanceCents: card.balanceCents,
      status: card.status
    });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ message: 'Server error fetching balance' });
  }
};

const topUpCard = async (req, res) => {
  try {
    const { cardId, amountCents, paymentMethodId } = req.body;

    const card = await SmartCard.findOne({ cardId });
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }
    if (card.status !== 'active') {
      return res.status(400).json({ message: 'Card is not active' });
    }

    // Fetch the payment method
    const method = await PaymentMethod.findOne({ _id: paymentMethodId, user: req.user.userId });
    if (!method) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    // 🔹 Charge the Visa/Master card via Stripe
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'lkr',
      payment_method: method.stripePaymentMethodId,
      confirm: true,
      customer: req.user.stripeCustomerId // assume user has Stripe customer profile
    });

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment failed', stripeStatus: paymentIntent.status });
    }

    // Update NFC card balance
    card.balanceCents += amountCents;
    await card.save();

    // Log transaction
    const transaction = new Transaction({
      card: card._id,
      user: card.owner,
      type: 'topup',
      amountCents: amountCents,
      status: 'paid',
      paymentMethod: method.type
    });
    await transaction.save();

    res.json({
      message: 'Top-up successful',
      newBalance: card.balanceCents
    });

  } catch (error) {
    console.error('Top-up error:', error);
    res.status(500).json({ message: 'Server error during top-up' });
  }
};

// Block card
const blockCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    
    const card = await SmartCard.findOne({ cardId });
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    card.status = 'blocked';
    await card.save();

    res.json({ message: 'Card blocked successfully' });
  } catch (error) {
    console.error('Block card error:', error);
    res.status(500).json({ message: 'Server error blocking card' });
  }
};

// Handle NFC tap-in/tap-out (used by IoT devices)
const handleTap = async (req, res) => {
  try {
    const { cardId, action, stopId, lat, lon, timestamp } = req.body;
    const device = req.device;

    // Find the card
    const card = await SmartCard.findOne({ cardId });
    if (!card) {
      return res.status(404).json({ 
        error: 'Card not found',
        message: 'Invalid card ID' 
      });
    }

    if (card.status !== 'active') {
      return res.status(400).json({ 
        error: 'Card not active',
        message: `Card status: ${card.status}` 
      });
    }

    // Update last tap time
    card.lastTapAt = new Date();
    await card.save();

    if (action === 'tap-in') {
      // Create pending transaction for tap-in
      const transaction = new Transaction({
        card: card._id,
        user: card.owner,
        type: 'tap-in',
        startStopId: stopId,
        busId: device.busId,
        status: 'pending',
        paymentMethod: 'balance'
      });
      await transaction.save();

      return res.json({
        ok: true,
        message: 'Tap-in successful',
        transactionId: transaction._id,
        cardId: card.cardId,
        balanceCents: card.balanceCents
      });

    } else if (action === 'tap-out') {
      // Find the most recent tap-in transaction for this card
      const lastTapIn = await Transaction.findOne({
        card: card._id,
        type: 'tap-in',
        status: 'pending'
      }).sort({ createdAt: -1 });

      if (!lastTapIn) {
        return res.status(400).json({
          error: 'No tap-in found',
          message: 'Please tap-in before tapping out'
        });
      }

      // Calculate distance (simplified - you can implement proper distance calculation)
      const distanceMeters = calculateDistance(
        { lat: parseFloat(lat), lon: parseFloat(lon) },
        { lat: parseFloat(lastTapIn.startStopLat || 0), lon: parseFloat(lastTapIn.startStopLon || 0) }
      ) * 1000; // Convert to meters

      // Get fare rule
      const fareRule = await FareRule.findOne({ name: 'default' });
      if (!fareRule) {
        return res.status(500).json({
          error: 'Fare rule not found',
          message: 'System configuration error'
        });
      }

      // Calculate fare
      const fareCents = computeFareCents(distanceMeters, fareRule);

      // Check if card has sufficient balance
      if (card.balanceCents < fareCents) {
        // Create due transaction
        const dueTransaction = new Transaction({
          card: card._id,
          user: card.owner,
          type: 'fare',
          amountCents: fareCents,
          distanceMeters,
          startStopId: lastTapIn.startStopId,
          endStopId: stopId,
          status: 'due',
          paymentMethod: 'balance',
          busId: device.busId
        });
        await dueTransaction.save();

        // Update tap-in transaction to failed
        lastTapIn.status = 'failed';
        await lastTapIn.save();

        return res.json({
          ok: false,
          error: 'insufficient_balance',
          message: 'Insufficient balance for fare',
          dueAmount: fareCents,
          transactionId: dueTransaction._id,
          cardId: card.cardId,
          balanceCents: card.balanceCents
        });
      }

      // Deduct fare from card balance
      card.balanceCents -= fareCents;
      await card.save();

      // Update tap-in transaction to completed
      lastTapIn.status = 'completed';
      await lastTapIn.save();

      // Create successful fare transaction
      const fareTransaction = new Transaction({
        card: card._id,
        user: card.owner,
        type: 'fare',
        amountCents: fareCents,
        distanceMeters,
        startStopId: lastTapIn.startStopId,
        endStopId: stopId,
        status: 'paid',
        paymentMethod: 'balance',
        busId: device.busId
      });
      await fareTransaction.save();

      return res.json({
        ok: true,
        message: 'Tap-out successful, fare deducted',
        transactionId: fareTransaction._id,
        fareCents,
        cardId: card.cardId,
        newBalanceCents: card.balanceCents
      });
    }

    return res.status(400).json({
      error: 'Invalid action',
      message: 'Action must be either "tap-in" or "tap-out"'
    });

  } catch (error) {
    console.error('Tap handling error:', error);
    res.status(500).json({
      error: 'Tap processing failed',
      message: 'Internal server error'
    });
  }
};

// Simple distance calculation (you can replace with more sophisticated calculation)
function calculateDistance(point1, point2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLon = (point2.lon - point1.lon) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
}

module.exports = {
  createCard,
  getUserCards,
  getCardBalance,
  topUpCard,
  blockCard,
  handleTap
};

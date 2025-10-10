const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment");
const paymentController = require("../controllers/paymentController");
const SmartCard = require('../models/SmartCard');
const VisaCard = require('../models/VisaCard');
const Transaction = require('../models/Transaction');
const Route = require('../models/RouteManagement/Route');


// Stripe webhook (raw body handled in server.js)
router.post("/webhook", paymentController.handleWebhook);

// Alias to support frontend makePayment -> POST /api/payments
router.post("/payments", async (req, res, next) => {
  // Delegate to existing /process logic
  req.url = "/process";
  next();
});

// Process payment
router.post("/process", async (req, res) => {
  try {
    const { cardNumber, amount, userId, routeId, distance } = req.body;
    
    // Determine card type and find card
    let card, cardType;
    
    if (cardNumber.length > 12) {
      // Visa card
      cardType = 'Visa';
      card = await VisaCard.findOne({ cardNumber, isActive: true });
    } else {
      // Smart card
      cardType = 'NFC';
      card = await SmartCard.findOne({ cardNumber, isActive: true });
    }
    
    if (!card) {
      return res.status(404).json({ error: "Card not found" });
    }
    
    if (card.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }
    
    // Update card balance
    card.balance -= amount;
    await card.save();
    
    // Create transaction
    const transaction = new Transaction({
      userId,
      cardNumber,
      cardType,
      amount,
      transactionType: 'payment',
      routeId,
      distance,
      fare: amount
    });
    
    await transaction.save();
    
    res.json({ 
      success: true, 
      newBalance: card.balance, 
      transaction,
      receiptSent: transaction.receiptSent
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Calculate fare
router.post("/calculate-fare", async (req, res) => {
  try {
    const { routeId, distance } = req.body;
    const route = await Route.findById(routeId);
    
    if (!route) {
      return res.status(404).json({ error: "Route not found" });
    }
    
    const fare = route.baseFare + (distance * route.farePerKm);
    res.json({ fare, route });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stripe Payment Routes
router.post('/stripe/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'lkr', visaCardId, nfcCardId } = req.body;
    
    const visaCard = await VisaCard.findOne({ cardNumber: visaCardId });
    if (!visaCard) {
      return res.status(404).json({ error: 'Visa card not found' });
    }
    
    if (visaCard.balance < amount) {
      return res.status(400).json({ error: `Insufficient balance. Available: Rs. ${visaCard.balance.toFixed(2)}` });
    }
    
    const nfcCard = await SmartCard.findOne({ cardNumber: nfcCardId });
    if (!nfcCard) {
      return res.status(404).json({ error: 'NFC card not found' });
    }
    
    const mockPaymentIntent = {
      id: 'pi_demo_' + Date.now(),
      client_secret: 'pi_demo_' + Date.now() + '_secret_demo',
      status: 'requires_payment_method'
    };

    res.json({
      clientSecret: mockPaymentIntent.client_secret,
      paymentIntentId: mockPaymentIntent.id,
      demoMode: true
    });
  } catch (error) {
    console.error('Payment Intent Error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/stripe/confirm-payment', async (req, res) => {
  try {
    const { paymentIntentId, visaCardId, nfcCardId, userId, amount } = req.body;
    
    const isDemoMode = paymentIntentId.startsWith('pi_demo_');
    
    if (isDemoMode || true) {
      const visaCard = await VisaCard.findOne({ cardNumber: visaCardId });
      const nfcCard = await SmartCard.findOne({ cardNumber: nfcCardId });
      
      if (!visaCard) {
        return res.status(404).json({ error: 'Visa card not found' });
      }
      
      if (!nfcCard) {
        return res.status(404).json({ error: 'NFC card not found' });
      }
      
      visaCard.balance -= amount;
      nfcCard.balance += amount;
      
      await visaCard.save();
      await nfcCard.save();
      
      const transaction = new Transaction({
        userId: "507f1f77bcf86cd799439011",
        cardNumber: nfcCardId,
        amount: amount,
        transactionType: 'recharge',
        status: 'completed',
        paymentMethod: 'stripe',
        stripePaymentIntentId: paymentIntentId,
        sourceCard: visaCardId
      });
      await transaction.save();
      
      res.json({
        success: true,
        message: 'Recharge successful',
        transactionId: transaction._id,
        visaCardBalance: visaCard.balance,
        nfcCardBalance: nfcCard.balance
      });
    } else {
      res.status(400).json({ error: 'Payment not completed' });
    }
  } catch (error) {
    console.error('Stripe Payment Confirmation Error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/stripe/config', (req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
  });
});

// Initialize sample data
router.post("/init-sample-data", async (req, res) => {
  try {
    const User = require('../models/User');
    const user = new User({
      email: "test@example.com",
      name: "Test User",
      phone: "1234567890"
    });
    await user.save();
    
    const routes = [
      {
        routeName: "City Center to Airport",
        startLocation: "City Center",
        endLocation: "Airport",
        distance: 15,
        baseFare: 2.50,
        farePerKm: 0.50
      },
      {
        routeName: "Downtown to University",
        startLocation: "Downtown",
        endLocation: "University",
        distance: 8,
        baseFare: 1.50,
        farePerKm: 0.30
      }
    ];
    
    for (const routeData of routes) {
      const route = new Route(routeData);
      await route.save();
    }
    
    const smartCard = new SmartCard({
      cardNumber: "1234567890",
      userId: user._id,
      balance: 100,
      cardType: "NFC"
    });
    await smartCard.save();
    
    const visaCard = new VisaCard({
      cardNumber: "4532123456789012",
      cardHolderName: "Test User",
      expiryDate: "12/25",
      cvv: "123",
      userId: user._id,
      balance: 200
    });
    await visaCard.save();
    
    res.json({ 
      message: "Sample data initialized successfully",
      userId: user._id,
      routes: routes.length,
      cards: 2
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stripe payment flow
router.post("/create-intent", paymentController.createPaymentIntent);
router.post("/confirm", paymentController.confirmPayment);
router.get("/history", paymentController.getPaymentHistory);

// Top-up endpoint (as per scaffold requirements)
router.post("/topup", async (req, res) => {
  try {
    const { userId, cardId, amountCents, currency = 'lkr' } = req.body;
    
    if (!userId || !cardId || !amountCents) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'userId, cardId, and amountCents are required' 
      });
    }

    // Verify card ownership
    const SmartCard = require('../models/SmartCard');
    const card = await SmartCard.findOne({ cardId, owner: userId });
    if (!card) {
      return res.status(404).json({ 
        error: 'Card not found',
        message: 'Card not found or not owned by user' 
      });
    }

    // Create Stripe PaymentIntent
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency,
      metadata: { 
        userId, 
        cardId, 
        txType: 'topup' 
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Top-up payment intent creation error:', error);
    res.status(500).json({ 
      error: 'Payment intent creation failed',
      message: 'Server error creating payment intent' 
    });
  }
});

// Visa/MasterCard management
router.post("/methods", paymentController.createPaymentMethod);
router.get("/methods", paymentController.getUserPaymentMethods);

// Legacy CRUD routes (optional)
router.post("/add", async (req, res) => {
  try {
    const {
      amount,
      method,
      status,
      currency,
      paymentGateway,
      cardLast4,
      cardBrand,
      cardExpYear,
      cardExpMonth
    } = req.body;

    const newPayment = new Payment({
      amount,
      method,
      status,
      currency,
      paymentGateway,
      cardLast4,
      cardBrand,
      cardExpMonth,
      cardExpYear,
      user: "507f1f77bcf86cd799439011"
    });

    await newPayment.save();
    res
      .status(201)
      .json({ message: "Payment Added Successfully", payment: newPayment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const payments = await Payment.find({ user: "507f1f77bcf86cd799439011" });
    res.json(payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    let payId = req.params.id;
    const {
      amount,
      method,
      status,
      currency,
      paymentGateway,
      cardLast4,
      cardBrand,
      cardExpMonth,
      cardExpYear
    } = req.body;

    const updatePayment = {
      amount,
      method,
      status,
      currency,
      paymentGateway,
      cardLast4,
      cardBrand,
      cardExpMonth,
      cardExpYear
    };

    await Payment.findByIdAndUpdate(payId, updatePayment, { new: true });
    res.status(200).json({ message: "Payment Updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    let payId = req.params.id;
    await Payment.findByIdAndDelete(payId);
    res.status(200).json({ message: "Payment Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/get/:id", async (req, res) => {
  try {
    let payId = req.params.id;
    const payment = await Payment.findById(payId);
    res.status(200).json({ message: "Payment Fetched", payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

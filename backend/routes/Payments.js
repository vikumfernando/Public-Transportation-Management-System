const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment");
const paymentController = require("../controllers/paymentController");

// Stripe webhook (raw body handled in server.js)
router.post("/webhook", paymentController.handleWebhook);

// Protected routes
//router.use(auth);

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
      user: req.user.userId
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
    const payments = await Payment.find({ user: req.user.userId });
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

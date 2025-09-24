const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Transaction = require("../models/Transaction");
const SmartCard = require("../models/SmartCard");
const Payment = require("../models/Payment");
const PaymentMethod = require("../models/PaymentMethod");
const User = require("../models/User");
const { sendReceipt } = require("../utils/mailer");

// 1. Create Stripe PaymentIntent
const createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = "lkr", cardId } = req.body;
    const userId = req.user.userId;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency,
      metadata: { userId, cardId }
    });

    const payment = new Payment({
      amount,
      method: "stripe",
      status: "pending",
      currency,
      paymentGateway: "stripe",
      user: userId,
      stripePaymentIntentId: paymentIntent.id
    });

    await payment.save();

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id
    });
  } catch (error) {
    console.error("Create payment intent error:", error);
    res.status(500).json({ message: "Server error creating payment" });
  }
};

// 2. Confirm Payment and top-up SmartCard
const confirmPayment = async (req, res) => {
  try {
    const { paymentId, cardId } = req.body;
    const userId = req.user.userId;

    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    const paymentIntent = await stripe.paymentIntents.retrieve(
      payment.stripePaymentIntentId
    );

    if (paymentIntent.status === "succeeded") {
      payment.status = "completed";
      await payment.save();

      if (cardId) {
        const card = await SmartCard.findOne({ cardId, owner: userId });
        if (card) {
          card.balanceCents += payment.amount * 100;
          await card.save();

          const transaction = new Transaction({
            card: card._id,
            user: userId,
            type: "topup",
            amountCents: payment.amount * 100,
            status: "paid",
            paymentMethod: "stripe",
            stripePaymentIntentId: payment.stripePaymentIntentId
          });
          await transaction.save();

          // Send digital receipt for top-up
          try {
            const user = await User.findById(userId);
            const receiptHtml = `
              <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Payment Receipt</h2>
                <div style="border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px;">
                  <p><strong>Card ID:</strong> ${cardId}</p>
                  <p><strong>Amount Added:</strong> LKR ${payment.amount.toFixed(2)}</p>
                  <p><strong>New Balance:</strong> LKR ${(card.balanceCents/100).toFixed(2)}</p>
                  <p><strong>Payment Method:</strong> Stripe</p>
                  <p><strong>Transaction ID:</strong> ${payment.stripePaymentIntentId}</p>
                  <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                </div>
              </div>
            `;
            
            await sendReceipt(user.email, 'Card Top-up Receipt', receiptHtml);
          } catch (emailError) {
            console.error('Failed to send top-up receipt:', emailError);
            // Don't fail the transaction if email fails
          }
        }
      }

      res.json({ message: "Payment confirmed successfully", payment });
    } else {
      res.status(400).json({ message: "Payment not completed" });
    }
  } catch (error) {
    console.error("Confirm payment error:", error);
    res.status(500).json({ message: "Server error confirming payment" });
  }
};

// 3. Payment history
const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;

    const payments = await Payment.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments({ user: userId });

    res.json({
      payments: payments.map((p) => ({
        id: p._id,
        amount: p.amount,
        method: p.method,
        status: p.status,
        currency: p.currency,
        createdAt: p.createdAt
      })),
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error("Get payment history error:", error);
    res.status(500).json({ message: "Server error fetching payment history" });
  }
};

// 4. Stripe webhook
const handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log("Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      const { userId, cardId, txType } = paymentIntent.metadata;

      // Update payment record if exists
      await Payment.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntent.id },
        { status: "completed" }
      );

      // Handle top-up if metadata indicates it
      if (txType === 'topup' && cardId && userId) {
        try {
          const SmartCard = require('../models/SmartCard');
          const Transaction = require('../models/Transaction');
          const User = require('../models/User');

          // Credit card balance
          const card = await SmartCard.findOne({ cardId, owner: userId });
          if (card) {
            card.balanceCents += paymentIntent.amount;
            await card.save();

            // Create top-up transaction
            const transaction = new Transaction({
              card: card._id,
              user: userId,
              type: 'topup',
              amountCents: paymentIntent.amount,
              status: 'paid',
              paymentMethod: 'stripe',
              stripePaymentIntentId: paymentIntent.id
            });
            await transaction.save();

            // Send email receipt
            const user = await User.findById(userId);
            if (user) {
              const receiptHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto;">
                  <h2 style="color: #2563eb;">Card Top-up Receipt</h2>
                  <div style="border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px;">
                    <p><strong>Card ID:</strong> ${cardId}</p>
                    <p><strong>Amount Added:</strong> LKR ${(paymentIntent.amount/100).toFixed(2)}</p>
                    <p><strong>New Balance:</strong> LKR ${(card.balanceCents/100).toFixed(2)}</p>
                    <p><strong>Payment Method:</strong> Stripe</p>
                    <p><strong>Transaction ID:</strong> ${paymentIntent.id}</p>
                    <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                  </div>
                </div>
              `;
              
              await sendReceipt(user.email, 'Card Top-up Receipt', receiptHtml);
            }
          }
        } catch (topupError) {
          console.error('Error processing top-up in webhook:', topupError);
          // Don't fail the webhook if top-up processing fails
        }
      }
      break;
    case "payment_intent.payment_failed":
      await Payment.findOneAndUpdate(
        { stripePaymentIntentId: event.data.object.id },
        { status: "failed" }
      );
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

// 5. Visa/MasterCard saving
const createPaymentMethod = async (req, res) => {
  try {
    const { type, cardholder, last4, expiry, number, cvv } = req.body;
    
    // For demo purposes, create a mock Stripe payment method ID
    // In production, you would create this via Stripe API
    const stripePaymentMethodId = `pm_demo_${Date.now()}`;

    const method = new PaymentMethod({
      user: req.user.userId,
      type: type || 'visa',
      cardholder: cardholder || 'Demo User',
      last4: last4 || number.slice(-4),
      expiry: expiry || '12/25',
      stripePaymentMethodId
    });

    await method.save();
    
    res.status(201).json({ 
      message: "Payment method added successfully", 
      method: {
        id: method._id,
        type: method.type,
        cardholder: method.cardholder,
        last4: method.last4,
        expiry: method.expiry
      }
    });
  } catch (err) {
    console.error("Error adding payment method:", err);
    res.status(500).json({ message: "Server error adding payment method" });
  }
};

// 6. Get all Visa/Master cards
const getUserPaymentMethods = async (req, res) => {
  try {
    const methods = await PaymentMethod.find({ user: req.user.userId });
    res.json({ methods });
  } catch (err) {
    console.error("Error fetching payment methods:", err);
    res.status(500).json({ message: "Server error fetching payment methods" });
  }
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
  getPaymentHistory,
  handleWebhook,
  createPaymentMethod,
  getUserPaymentMethods
};

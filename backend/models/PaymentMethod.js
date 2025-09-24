const mongoose = require('mongoose');

const PaymentMethodSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['visa', 'mastercard'], required: true },
  cardholder: { type: String, required: true },
  last4: { type: String, required: true },
  expiry: { type: String, required: true },
  stripePaymentMethodId: { type: String, required: true }, // token/id from Stripe
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PaymentMethod', PaymentMethodSchema);

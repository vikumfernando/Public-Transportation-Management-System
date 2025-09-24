const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  cardNumber: {
    type: String,
    required: true
  },
  cardType: {
    type: String,
    required: false,
    enum: ['NFC', 'RFID', 'Visa'],
    default: 'NFC'
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01
  },
  transactionType: {
    type: String,
    required: true,
    enum: ['payment', 'topup', 'refund', 'transport_payment']
  },
  description: {
    type: String,
    default: 'Transportation Payment'
  },
  status: {
    type: String,
    default: 'completed',
    enum: ['pending', 'completed', 'failed', 'refunded']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  // For transport payments
  fromLocation: {
    type: String
  },
  toLocation: {
    type: String
  },
  distance: {
    type: Number
  },
  paymentMethod: {
    type: String,
    default: 'nfc_card'
  },
  sourceCard: {
    type: String
  },
  // For Visa cards
  cvv: {
    type: String,
    required: function() {
      return this.cardType === 'Visa';
    }
  },
  expiryDate: {
    type: String,
    required: function() {
      return this.cardType === 'Visa';
    }
  }
});

// Index for faster queries
transactionSchema.index({ cardNumber: 1 });
transactionSchema.index({ cardType: 1 });
transactionSchema.index({ timestamp: -1 });
transactionSchema.index({ status: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  }, // in normal currency units (e.g. 500 = LKR 500)
  currency: { 
    type: String, 
    default: 'lkr' 
  },
  method: { 
    type: String, 
    enum: ['stripe', 'visa', 'mastercard'], 
    default: 'stripe' 
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'], 
    default: 'pending' 
  },
  paymentGateway: { 
    type: String, 
    default: 'stripe' 
  },
  stripePaymentIntentId: { 
    type: String 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Payment', PaymentSchema);

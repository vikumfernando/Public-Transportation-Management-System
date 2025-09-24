const mongoose = require('mongoose');

const nfcCardSchema = new mongoose.Schema({
  cardNumber: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        // NFC cards are typically 8-12 digits
        return /^[0-9]{8,12}$/.test(v);
      },
      message: 'Invalid NFC card number format'
    }
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  cardType: {
    type: String,
    default: 'NFC',
    enum: ['NFC', 'RFID']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUsed: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
nfcCardSchema.index({ cardNumber: 1 });
nfcCardSchema.index({ isActive: 1 });

// Method to mask card number for display
nfcCardSchema.methods.getMaskedNumber = function() {
  return 'Card #' + this.cardNumber;
};

module.exports = mongoose.model('NFCCard', nfcCardSchema);


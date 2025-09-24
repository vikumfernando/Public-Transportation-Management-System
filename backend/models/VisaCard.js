const mongoose = require('mongoose');

const visaCardSchema = new mongoose.Schema({
  cardNumber: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        // Visa cards start with 4 and are exactly 16 digits
        return /^4[0-9]{15}$/.test(v);
      },
      message: 'Visa card must start with 4 and be exactly 16 digits'
    }
  },
  cardHolderName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  expiryDate: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        // Format: MM/YY with proper month validation (01-12)
        const monthYearRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
        if (!monthYearRegex.test(v)) return false;
        
        const [month, year] = v.split('/');
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;
        const cardYear = parseInt(year);
        const cardMonth = parseInt(month);
        
        // Check if card is not expired
        if (cardYear < currentYear || (cardYear === currentYear && cardMonth < currentMonth)) {
          return false;
        }
        
        return true;
      },
      message: 'Invalid expiry date format (MM/YY) or card is expired'
    }
  },
  cvv: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        // Exactly 3 digits for Visa cards
        return /^[0-9]{3}$/.test(v);
      },
      message: 'CVV must be exactly 3 digits'
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
    default: 'Visa',
    enum: ['Visa']
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
visaCardSchema.index({ cardNumber: 1 });
visaCardSchema.index({ cardHolderName: 1 });
visaCardSchema.index({ isActive: 1 });

// Method to check if card is expired
visaCardSchema.methods.isExpired = function() {
  const [month, year] = this.expiryDate.split('/');
  const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
  return expiryDate < new Date();
};

// Method to mask card number for display
visaCardSchema.methods.getMaskedNumber = function() {
  return '**** **** **** ' + this.cardNumber.slice(-4);
};

// Static method to validate card number
visaCardSchema.statics.validateCardNumber = function(cardNumber) {
  // Luhn algorithm for Visa card validation
  const digits = cardNumber.replace(/\D/g, '');
  let sum = 0;
  let isEven = false;
  
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

module.exports = mongoose.model('VisaCard', visaCardSchema);


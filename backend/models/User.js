const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot be more than 50 characters'],
      validate: {
        validator: function(v) {
          return /^[a-zA-Z\s'-]+$/.test(v);
        },
        message: 'First name can only contain letters, spaces, hyphens, and apostrophes'
      }
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot be more than 50 characters'],
      validate: {
        validator: function(v) {
          return /^[a-zA-Z\s'-]+$/.test(v);
        },
        message: 'Last name can only contain letters, spaces, hyphens, and apostrophes'
      }
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email address'],
      index: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      validate: {
        validator: function(v) {
          return /^\+?[1-9]\d{1,14}$/.test(v);
        },
        message: 'Please enter a valid phone number with country code (e.g., +1234567890)'
      },
      unique: true,
      index: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false,
      validate: {
        validator: function(v) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(v);
        },
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      }
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'admin', 'driver', 'conductor'],
        message: 'Role is either: user, admin, driver, or conductor'
      },
      default: 'user'
    },
    isActive: {
      type: Boolean,
      default: true,
      select: false
    },
    emailVerified: {
      type: Boolean,
      default: false,
      select: false
    },
    phoneVerified: {
      type: Boolean,
      default: false,
      select: false
    },
    lastLogin: Date,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { unique: true });

// Document middleware: hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    // Only hash the password if it's modified or new
    if (!this.isModified('password')) return next();
    
    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    
    // Delete passwordConfirm field
    this.passwordConfirm = undefined;
    
    next();
  } catch (error) {
    next(error);
  }
});

// Update passwordChangedAt property when password is modified
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  
  this.passwordChangedAt = Date.now() - 1000; // 1 second in the past to ensure token is created after
  next();
});

// Query middleware to filter out inactive users by default
userSchema.pre(/^find/, function(next) {
  // This points to the current query
  this.find({ active: { $ne: false } });
  next();
});

// Instance method to check if password is correct
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method to check if password was changed after token was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  
  // False means NOT changed
  return false;
};

// Instance method to create password reset token
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Instance method to create email verification token
userSchema.methods.createEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
    
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return verificationToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;

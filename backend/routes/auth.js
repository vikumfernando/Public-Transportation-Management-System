const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');
const { createAndSendToken } = require('../utils/authUtils');

// @desc      Register user
// @route     POST /api/v1/auth/register
// @access    Public
router.post(
  '/register',
  [
    body('firstName', 'First name is required')
      .notEmpty()
      .trim()
      .escape()
      .isLength({ max: 50 })
      .withMessage('First name cannot be longer than 50 characters'),
    body('lastName', 'Last name is required')
      .notEmpty()
      .trim()
      .escape()
      .isLength({ max: 50 })
      .withMessage('Last name cannot be longer than 50 characters'),
    body('email', 'Please include a valid email')
      .isEmail()
      .normalizeEmail()
      .isLength({ max: 255 }),
    body('phone', 'Please include a valid phone number')
      .matches(/^\+?[1-9]\d{1,14}$/)
      .withMessage('Please enter a valid phone number with country code'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
      .withMessage(
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    })
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array()[0].msg, 400));
      }

      const { firstName, lastName, email, phone, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ 
        $or: [{ email }, { phone }] 
      });

      if (existingUser) {
        let message = 'User already exists';
        if (existingUser.email === email) {
          message = 'Email is already in use';
        } else if (existingUser.phone === phone) {
          message = 'Phone number is already in use';
        }
        return next(new ErrorResponse(message, 400));
      }

      // Create new user
      const user = await User.create({
        firstName,
        lastName,
        email,
        phone,
        password
      });

      // Generate email verification token
      const verificationToken = user.createEmailVerificationToken();
      await user.save({ validateBeforeSave: false });

      // Send verification email
      const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email/${verificationToken}`;
      
      const message = `Please verify your email by clicking on the link: \n${verificationUrl}\n\nIf you didn't create an account, please ignore this email.`;

      try {
        await sendEmail({
          email: user.email,
          subject: 'Email Verification',
          message
        });

        // Send response with token (user is automatically logged in after registration)
        createAndSendToken(user, 201, res);
      } catch (error) {
        // If email sending fails, remove the user and return error
        await User.findByIdAndDelete(user._id);
        return next(
          new ErrorResponse('Email could not be sent', 500)
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

// @desc      Login user
// @route     POST /api/v1/auth/login
// @access    Public
router.post(
  '/login',
  [
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
    body('password', 'Password is required').exists()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array()[0].msg, 400));
      }

      const { email, password } = req.body;

      // Check if user exists
      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        return next(new ErrorResponse('Invalid credentials', 401));
      }

      // Check if password is correct
      const isMatch = await user.correctPassword(password, user.password);

      if (!isMatch) {
        return next(new ErrorResponse('Invalid credentials', 401));
      }

      // Check if user is active
      if (!user.isActive) {
        return next(new ErrorResponse('Your account has been deactivated', 401));
      }

      // Update last login
      user.lastLogin = Date.now();
      await user.save({ validateBeforeSave: false });

      // Send token to client
      createAndSendToken(user, 200, res);
    } catch (error) {
      next(error);
    }
  }
);

// @desc      Get current logged in user
// @route     GET /api/v1/auth/me
// @access    Private
router.get('/me', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @desc      Update user details
// @route     PUT /api/v1/auth/updatedetails
// @access    Private
router.put(
  '/updatedetails',
  [
    body('firstName', 'First name is required').optional().trim().notEmpty(),
    body('lastName', 'Last name is required').optional().trim().notEmpty(),
    body('email', 'Please include a valid email').optional().isEmail(),
    body('phone', 'Please include a valid phone number')
      .optional()
      .matches(/^\+?[1-9]\d{1,14}$/)
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array()[0].msg, 400));
      }

      const fieldsToUpdate = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone
      };

      const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
      });

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }
);

// @desc      Update password
// @route     PUT /api/v1/auth/updatepassword
// @access    Private
router.put(
  '/updatepassword',
  [
    body('currentPassword', 'Current password is required').exists(),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
      .withMessage(
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      )
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array()[0].msg, 400));
      }

      const user = await User.findById(req.user.id).select('+password');

      // Check current password
      const isMatch = await user.correctPassword(
        req.body.currentPassword,
        user.password
      );

      if (!isMatch) {
        return next(new ErrorResponse('Password is incorrect', 401));
      }

      user.password = req.body.newPassword;
      await user.save();

      createAndSendToken(user, 200, res);
    } catch (error) {
      next(error);
    }
  }
);

// @desc      Forgot password
// @route     POST /api/v1/auth/forgotpassword
// @access    Public
router.post(
  '/forgotpassword',
  [body('email', 'Please include a valid email').isEmail().normalizeEmail()],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array()[0].msg, 400));
      }

      const user = await User.findOne({ email: req.body.email });

      if (!user) {
        return next(new ErrorResponse('No user found with that email', 404));
      }

      // Generate reset token
      const resetToken = user.createPasswordResetToken();
      await user.save({ validateBeforeSave: false });

      // Create reset URL
      const resetUrl = `${req.protocol}://${req.get(
        'host'
      )}/api/v1/auth/resetpassword/${resetToken}`;

      const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

      try {
        await sendEmail({
          email: user.email,
          subject: 'Password reset token',
          message
        });

        res.status(200).json({
          success: true,
          data: 'Email sent'
        });
      } catch (error) {
        console.error(error);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(
          new ErrorResponse('Email could not be sent', 500)
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

// @desc      Reset password
// @route     PUT /api/v1/auth/resetpassword/:resettoken
// @access    Public
router.put(
  '/resetpassword/:resettoken',
  [
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
      .withMessage(
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      )
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array()[0].msg, 400));
      }

      // Get hashed token
      const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');

      const user = await User.findOne({
        passwordResetToken: resetPasswordToken,
        passwordResetExpires: { $gt: Date.now() }
      });

      if (!user) {
        return next(new ErrorResponse('Invalid token or token has expired', 400));
      }

      // Set new password
      user.password = req.body.password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      createAndSendToken(user, 200, res);
    } catch (error) {
      next(error);
    }
  }
);

// @desc      Verify email
// @route     GET /api/v1/auth/verifyemail/:verificationtoken
// @access    Public
router.get('/verifyemail/:verificationtoken', async (req, res, next) => {
  try {
    const verificationToken = crypto
      .createHash('sha256')
      .update(req.params.verificationtoken)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken: verificationToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return next(new ErrorResponse('Invalid token or token has expired', 400));
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      data: 'Email verified successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc      Logout user / clear cookie
// @route     GET /api/v1/auth/logout
// @access    Private
router.get('/logout', (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

module.exports = router;

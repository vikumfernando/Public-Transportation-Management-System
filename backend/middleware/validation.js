const { body, query } = require('express-validator');

// User registration validation
const validateRegister = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
    
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
    
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address (e.g., user@gmail.com)')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email cannot exceed 100 characters')
    .custom((value) => {
      // Check for common email domains
      const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'protonmail.com'];
      const domain = value.split('@')[1]?.toLowerCase();
      
      if (domain && !commonDomains.includes(domain) && !domain.includes('.')) {
        throw new Error('Please use a valid email domain (e.g., @gmail.com, @yahoo.com)');
      }
      
      return true;
    }),
    
  body('phoneNumber')
    .matches(/^[+]?[\d\s\-()]{10,15}$/)
    .withMessage('Please provide a valid phone number (10-15 digits)'),
    
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)'),
    
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    })
];

// User login validation
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address (e.g., user@gmail.com)')
    .normalizeEmail(),
    
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
    
  body('rememberMe')
    .optional()
    .isBoolean()
    .withMessage('Remember me must be a boolean value')
];

// Email validation
const validateEmail = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address (e.g., user@gmail.com)')
    .normalizeEmail()
];

// Password reset validation
const validatePasswordReset = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
    
  body('newPassword')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)')
];

// Email availability check validation
const validateEmailCheck = [
  query('email')
    .isEmail()
    .withMessage('Please provide a valid email address (e.g., user@gmail.com)')
    .normalizeEmail()
];

// Profile update validation
const validateProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
    
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
    
  body('phoneNumber')
    .optional()
    .matches(/^[+]?[\d\s\-()]{10,15}$/)
    .withMessage('Please provide a valid phone number (10-15 digits)')
];

// Change password validation
const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
    
  body('newPassword')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    }),
    
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    })
];

module.exports = {
  validateRegister,
  validateLogin,
  validateEmail,
  validatePasswordReset,
  validateEmailCheck,
  validateProfileUpdate,
  validateChangePassword
};

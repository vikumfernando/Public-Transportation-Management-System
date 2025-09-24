const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

/**
 * Middleware to verify JWT token and protect routes
 */
exports.protect = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  // Check for token in Authorization header
  if (authHeader && authHeader.startsWith('Bearer')) {
    try {
      // Extract token from header
      token = authHeader.split(' ')[1];

      if (!token) {
        return next(new ErrorResponse('Not authorized, no token provided', 401));
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token and attach to request object
      const user = await User.findById(decoded.user.id).select('-password');
      
      if (!user) {
        return next(new ErrorResponse('User not found', 404));
      }

      // Check if user is active
      if (!user.isActive) {
        return next(new ErrorResponse('User account is inactive', 401));
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      
      if (error.name === 'JsonWebTokenError') {
        return next(new ErrorResponse('Invalid token', 401));
      }
      
      if (error.name === 'TokenExpiredError') {
        return next(new ErrorResponse('Token has expired', 401));
      }
      
      return next(new ErrorResponse('Not authorized, authentication failed', 401));
    }
  } else {
    return next(new ErrorResponse('Not authorized, no token provided', 401));
  }
};

/**
 * Middleware to authorize user roles
 * @param  {...string} roles - Allowed roles
 * @returns {Function} Middleware function
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorResponse('User not authenticated', 401));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    
    next();
  };
};

/**
 * Middleware to check if user is the owner of the resource or admin
 * @param {Object} options - Configuration options
 * @param {string} options.model - The model name
 * @param {string} options.paramName - The parameter name for the resource ID
 * @returns {Function} Middleware function
 */
exports.checkOwnership = ({ model, paramName = 'id' } = {}) => {
  return async (req, res, next) => {
    try {
      // Skip if user is admin
      if (req.user.role === 'admin') {
        return next();
      }

      // Get the resource
      const resource = await model.findById(req.params[paramName]);
      
      if (!resource) {
        return next(new ErrorResponse('Resource not found', 404));
      }

      // Check if the user is the owner
      if (resource.user.toString() !== req.user.id) {
        return next(
          new ErrorResponse('Not authorized to access this resource', 403)
        );
      }

      // Attach resource to request object for later use
      req.resource = resource;
      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      next(error);
    }
  };
};

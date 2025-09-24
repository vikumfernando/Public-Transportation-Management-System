/**
 * Custom error response class that extends the standard Error
 * @extends Error
 */
class ErrorResponse extends Error {
  /**
   * Create a new ErrorResponse
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {Object} [data] - Additional error data
   */
  constructor(message, statusCode, data = {}) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
    
    // Ensure the name of this error is the same as the class name
    this.name = this.constructor.name;
    
    // Capture stack trace, excluding constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }
  
  /**
   * Create a standardized error response object
   * @returns {Object} Standardized error response
   */
  toJSON() {
    return {
      success: false,
      message: this.message,
      statusCode: this.statusCode,
      ...(Object.keys(this.data).length > 0 && { data: this.data }),
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack })
    };
  }
  
  /**
   * Create a new ErrorResponse from another error
   * @param {Error} error - Original error
   * @param {number} [statusCode=500] - HTTP status code
   * @returns {ErrorResponse} New ErrorResponse instance
   */
  static fromError(error, statusCode = 500) {
    if (error instanceof ErrorResponse) {
      return error;
    }
    
    const errorResponse = new ErrorResponse(
      error.message || 'Internal Server Error',
      statusCode,
      { originalError: error.name }
    );
    
    // Preserve the original stack trace if available
    if (error.stack) {
      errorResponse.stack = error.stack;
    }
    
    return errorResponse;
  }
}

module.exports = ErrorResponse;

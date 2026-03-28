// =====================================================
// ERROR HANDLER MIDDLEWARE CLASS - XỬ LÝ LỖI (OOP)
// =====================================================

const { HTTP_STATUS } = require('../utils/constants');
const Logger = require('../utils/logger');

class ErrorHandler {
  /**
   * Not Found Handler
   */
  static notFound(req, res, next) {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
  }

  /**
   * Global Error Handler
   */
  static handleError(err, req, res, next) {
    // Log error
    Logger.error(err.message, {
      stack: err.stack,
      path: req.path,
      method: req.method,
      ip: req.ip
    });

    const statusCode = res.statusCode === 200 
      ? HTTP_STATUS.INTERNAL_SERVER_ERROR 
      : res.statusCode;

    res.status(statusCode).json({
      success: false,
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
      errors: err.errors || null
    });
  }

  /**
   * Async Handler - Wrap async functions
   */
  static asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }
}

module.exports = ErrorHandler;

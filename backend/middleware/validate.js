// =====================================================
// VALIDATION MIDDLEWARE CLASS - KIỂM TRA DỮ LIỆU (OOP)
// =====================================================

const { validationResult } = require('express-validator');
const { HTTP_STATUS } = require('../utils/constants');
const HelperUtils = require('../utils/helpers');

class ValidationMiddleware {
  /**
   * Validate request data
   */
  static validate(req, res, next) {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      const extractedErrors = errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }));

      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        HelperUtils.errorResponse('Dữ liệu không hợp lệ', extractedErrors)
      );
    }
    
    next();
  }
}

module.exports = ValidationMiddleware;

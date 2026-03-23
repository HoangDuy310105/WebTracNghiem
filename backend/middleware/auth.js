// =====================================================
// AUTH MIDDLEWARE CLASS - XÁC THỰC JWT TOKEN (OOP)
// =====================================================

const jwt = require('jsonwebtoken');
const { HTTP_STATUS, MESSAGES } = require('../utils/constants');
const HelperUtils = require('../utils/helpers');

class AuthMiddleware {
  /**
   * Verify JWT token và gắn user vào request
   */
  static async authenticate(req, res, next) {
    try {
      // Lấy token từ header
      const authHeader = req.headers.authorization;
      console.log(`Auth attempt: ${req.method} ${req.path} - Header present: ${!!authHeader}`);
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('Auth failed: Missing or invalid header:', authHeader);
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(
          HelperUtils.errorResponse(MESSAGES.UNAUTHORIZED)
        );
      }

      const token = authHeader.split(' ')[1];

      // Verify token
      console.log('Verifying token:', token.substring(0, 10) + '...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token verified for user:', decoded.email);
      
      // Gắn user info vào request
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };

      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(
          HelperUtils.errorResponse('Token không hợp lệ')
        );
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(
          HelperUtils.errorResponse('Token đã hết hạn')
        );
      }
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        HelperUtils.errorResponse(MESSAGES.ERROR)
      );
    }
  }

  /**
   * Check user role
   */
  static authorize(...roles) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(
          HelperUtils.errorResponse(MESSAGES.UNAUTHORIZED)
        );
      }

      if (!roles.includes(req.user.role)) {
        return res.status(HTTP_STATUS.FORBIDDEN).json(
          HelperUtils.errorResponse(MESSAGES.FORBIDDEN)
        );
      }

      next();
    };
  }
}

module.exports = AuthMiddleware;

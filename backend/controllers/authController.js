// =====================================================
// AUTH CONTROLLER CLASS - HTTP handler (thin), gọi AuthService
// =====================================================

const { HTTP_STATUS, MESSAGES } = require('../utils/constants');
const HelperUtils = require('../utils/helpers');
const Logger = require('../utils/logger');
const AuthService = require('../Services/AuthService');

// Map từ error.type sang HTTP status code
const TYPE_TO_STATUS = {
  CONFLICT: HTTP_STATUS.CONFLICT,
  UNAUTHORIZED: HTTP_STATUS.UNAUTHORIZED,
  FORBIDDEN: HTTP_STATUS.FORBIDDEN,
  NOT_FOUND: HTTP_STATUS.NOT_FOUND,
  BAD_REQUEST: HTTP_STATUS.BAD_REQUEST
};

class AuthController {
  /**
   * Đăng ký tài khoản mới
   * POST /api/auth/register
   */
  static async register(req, res) {
    try {
      const data = await AuthService.register(req.body);
      res.status(HTTP_STATUS.CREATED).json(
        HelperUtils.successResponse(MESSAGES.REGISTER_SUCCESS, data)
      );
    } catch (error) {
      if (error.type) {
        return res.status(TYPE_TO_STATUS[error.type] || HTTP_STATUS.BAD_REQUEST).json(
          HelperUtils.errorResponse(error.message)
        );
      }
      Logger.error('Register error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        HelperUtils.errorResponse(MESSAGES.ERROR)
      );
    }
  }

  /**
   * Đăng nhập
   * POST /api/auth/login
   */
  static async login(req, res) {
    try {
      const data = await AuthService.login(req.body);
      res.status(HTTP_STATUS.OK).json(
        HelperUtils.successResponse(MESSAGES.LOGIN_SUCCESS, data)
      );
    } catch (error) {
      if (error.type) {
        return res.status(TYPE_TO_STATUS[error.type] || HTTP_STATUS.BAD_REQUEST).json(
          HelperUtils.errorResponse(error.message)
        );
      }
      Logger.error('Login error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        HelperUtils.errorResponse(MESSAGES.ERROR)
      );
    }
  }

  /**
   * Lấy thông tin user hiện tại
   * GET /api/auth/me
   */
  static async getMe(req, res) {
    try {
      const user = await AuthService.getMe(req.user.id);
      res.status(HTTP_STATUS.OK).json(
        HelperUtils.successResponse('Thành công', user)
      );
    } catch (error) {
      if (error.type) {
        return res.status(TYPE_TO_STATUS[error.type] || HTTP_STATUS.BAD_REQUEST).json(
          HelperUtils.errorResponse(error.message)
        );
      }
      Logger.error('Get me error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        HelperUtils.errorResponse(MESSAGES.ERROR)
      );
    }
  }

  /**
   * Cập nhật profile
   * PUT /api/auth/profile
   */
  static async updateProfile(req, res) {
    try {
      const data = await AuthService.updateProfile(req.user.id, req.body);
      res.status(HTTP_STATUS.OK).json(
        HelperUtils.successResponse('Cập nhật thành công', data)
      );
    } catch (error) {
      if (error.type) {
        return res.status(TYPE_TO_STATUS[error.type] || HTTP_STATUS.BAD_REQUEST).json(
          HelperUtils.errorResponse(error.message)
        );
      }
      Logger.error('Update profile error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        HelperUtils.errorResponse(MESSAGES.ERROR)
      );
    }
  }
}

module.exports = AuthController;

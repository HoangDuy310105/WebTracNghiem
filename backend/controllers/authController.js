// =====================================================
// AUTH CONTROLLER CLASS - XỬ LÝ ĐĂNG KÝ/ĐĂNG NHẬP (OOP)
// =====================================================

const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { HTTP_STATUS, MESSAGES, ROLES } = require('../utils/constants');
const HelperUtils = require('../utils/helpers');
const Logger = require('../utils/logger');

class AuthController {
  /**
   * Đăng ký tài khoản mới
   * POST /api/auth/register
   */
  static async register(req, res) {
    try {
      const { fullName, email, password, role } = req.body;

      // Kiểm tra email đã tồn tại
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(HTTP_STATUS.CONFLICT).json(
          HelperUtils.errorResponse(MESSAGES.EMAIL_EXISTS)
        );
      }

      // Hash password
      const hashedPassword = await HelperUtils.hashPassword(password);

      // Tạo user mới
      const user = await User.create({
        fullName,
        email,
        password: hashedPassword,
        role: role || ROLES.STUDENT
      });

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      Logger.info(`User registered: ${email}`);

      res.status(HTTP_STATUS.CREATED).json(
        HelperUtils.successResponse(MESSAGES.REGISTER_SUCCESS, {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          token
        })
      );
    } catch (error) {
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
      const { email, password } = req.body;

      // Tìm user theo email
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(
          HelperUtils.errorResponse(MESSAGES.LOGIN_FAILED)
        );
      }

      // Kiểm tra password
      const isPasswordValid = await HelperUtils.comparePassword(
        password,
        user.password
      );

      if (!isPasswordValid) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(
          HelperUtils.errorResponse(MESSAGES.LOGIN_FAILED)
        );
      }

      // Kiểm tra tài khoản có active không
      if (!user.isActive) {
        return res.status(HTTP_STATUS.FORBIDDEN).json(
          HelperUtils.errorResponse('Tài khoản đã bị khóa')
        );
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      Logger.info(`User logged in: ${email}`);

      res.status(HTTP_STATUS.OK).json(
        HelperUtils.successResponse(MESSAGES.LOGIN_SUCCESS, {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          token
        })
      );
    } catch (error) {
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
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          HelperUtils.errorResponse(MESSAGES.NOT_FOUND)
        );
      }

      res.status(HTTP_STATUS.OK).json(
        HelperUtils.successResponse('Thành công', user)
      );
    } catch (error) {
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
      const { fullName, password } = req.body;
      const user = await User.findByPk(req.user.id);

      if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          HelperUtils.errorResponse(MESSAGES.NOT_FOUND)
        );
      }

      // Cập nhật fullName
      if (fullName) {
        user.fullName = fullName;
      }

      // Cập nhật password nếu có
      if (password) {
        user.password = await HelperUtils.hashPassword(password);
      }

      await user.save();

      res.status(HTTP_STATUS.OK).json(
        HelperUtils.successResponse('Cập nhật thành công', {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role
        })
      );
    } catch (error) {
      Logger.error('Update profile error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        HelperUtils.errorResponse(MESSAGES.ERROR)
      );
    }
  }
}

module.exports = AuthController;

// =====================================================
// AUTH ROUTES - ĐĂNG KÝ/ĐĂNG NHẬP (OOP)
// =====================================================

const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/authController');
const AuthMiddleware = require('../middleware/auth');
const ValidationMiddleware = require('../middleware/validate');
const { registerValidator, loginValidator } = require('../validators/authValidator');

// ===== PUBLIC ROUTES =====

/**
 * @route   POST /api/auth/register
 * @desc    Đăng ký tài khoản mới
 * @access  Public
 */
router.post(
  '/register',
  registerValidator,
  ValidationMiddleware.validate,
  AuthController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Đăng nhập
 * @access  Public
 */
router.post(
  '/login',
  loginValidator,
  ValidationMiddleware.validate,
  AuthController.login
);

// ===== PROTECTED ROUTES =====

/**
 * @route   GET /api/auth/me
 * @desc    Lấy thông tin user hiện tại
 * @access  Private
 */
router.get('/me', AuthMiddleware.authenticate, AuthController.getMe);

/**
 * @route   PUT /api/auth/profile
 * @desc    Cập nhật profile
 * @access  Private
 */
router.put('/profile', AuthMiddleware.authenticate, AuthController.updateProfile);

module.exports = router;

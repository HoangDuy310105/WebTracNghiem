// =====================================================
// ADMIN ROUTES - QUẢN TRỊ HỆ THỐNG (OOP)
// =====================================================

const express = require('express');
const router = express.Router();

const AdminController = require('../controllers/adminController');
const AuthMiddleware = require('../middleware/auth');
const ValidationMiddleware = require('../middleware/validate');
const { registerValidator } = require('../validators/authValidator');
const { ROLES } = require('../utils/constants');

// ===== ADMIN ONLY ROUTES =====
// Tất cả routes đều cần admin role
router.use(AuthMiddleware.authenticate);
router.use(AuthMiddleware.authorize(ROLES.ADMIN));

/**
 * @route   GET /api/admin/stats
 * @desc    Lấy dashboard statistics
 * @access  Admin
 */
router.get('/stats', AdminController.getStats);

/**
 * @route   GET /api/admin/users
 * @desc    Lấy danh sách users
 * @access  Admin
 */
router.get('/users', AdminController.getUsers);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Lấy chi tiết user
 * @access  Admin
 */
router.get('/users/:id', AdminController.getUserById);

/**
 * @route   POST /api/admin/users
 * @desc    Tạo user mới
 * @access  Admin
 */
router.post(
  '/users',
  registerValidator,
  ValidationMiddleware.validate,
  AdminController.createUser
);

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Cập nhật user
 * @access  Admin
 */
router.put('/users/:id', AdminController.updateUser);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Xóa user
 * @access  Admin
 */
router.delete('/users/:id', AdminController.deleteUser);

/**
 * @route   PATCH /api/admin/users/:id/toggle-active
 * @desc    Toggle active status
 * @access  Admin
 */
router.patch('/users/:id/toggle-active', AdminController.toggleUserActive);

module.exports = router;

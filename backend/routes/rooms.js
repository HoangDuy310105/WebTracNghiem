// =====================================================
// ROOM ROUTES - QUẢN LÝ PHÒNG THI (OOP)
// =====================================================

const express = require('express');
const router = express.Router();

const RoomController = require('../controllers/roomController');
const AuthMiddleware = require('../middleware/auth');
const ValidationMiddleware = require('../middleware/validate');
const { createRoomValidator, joinRoomValidator } = require('../validators/roomValidator');
const { ROLES } = require('../utils/constants');

// ===== PROTECTED ROUTES =====
router.use(AuthMiddleware.authenticate);

/**
 * @route   GET /api/rooms
 * @desc    Lấy danh sách phòng thi
 * @access  Private
 */
router.get('/', RoomController.getRooms);

/**
 * @route   GET /api/rooms/:id
 * @desc    Lấy chi tiết phòng thi
 * @access  Private
 */
router.get('/:id', RoomController.getRoomById);

/**
 * @route   POST /api/rooms
 * @desc    Tạo phòng thi mới
 * @access  Teacher, Admin
 */
router.post(
  '/',
  AuthMiddleware.authorize(ROLES.TEACHER, ROLES.ADMIN),
  createRoomValidator,
  ValidationMiddleware.validate,
  RoomController.createRoom
);

/**
 * @route   POST /api/rooms/join
 * @desc    Tham gia phòng thi bằng mã code
 * @access  Student
 */
router.post(
  '/join',
  AuthMiddleware.authorize(ROLES.STUDENT),
  joinRoomValidator,
  ValidationMiddleware.validate,
  RoomController.joinRoom
);

/**
 * @route   PATCH /api/rooms/:id/status
 * @desc    Cập nhật trạng thái phòng
 * @access  Teacher (owner), Admin
 */
router.patch(
  '/:id/status',
  AuthMiddleware.authorize(ROLES.TEACHER, ROLES.ADMIN),
  RoomController.updateRoomStatus
);

/**
 * @route   DELETE /api/rooms/:id
 * @desc    Xóa phòng thi
 * @access  Teacher (owner), Admin
 */
router.delete(
  '/:id',
  AuthMiddleware.authorize(ROLES.TEACHER, ROLES.ADMIN),
  RoomController.deleteRoom
);

module.exports = router;

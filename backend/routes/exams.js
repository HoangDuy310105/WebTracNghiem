// =====================================================
// EXAM ROUTES - QUẢN LÝ ĐỀ THI (OOP)
// =====================================================

const express = require('express');
const router = express.Router();

const ExamController = require('../controllers/examController');
const AuthMiddleware = require('../middleware/auth');
const ValidationMiddleware = require('../middleware/validate');
const { createExamValidator, examIdValidator } = require('../validators/examValidator');
const { ROLES } = require('../utils/constants');

// ===== PROTECTED ROUTES =====
// Tất cả routes đều cần authentication
router.use(AuthMiddleware.authenticate);

/**
 * @route   GET /api/exams
 * @desc    Lấy danh sách đề thi
 * @access  Private
 */
router.get('/', ExamController.getExams);

/**
 * @route   GET /api/exams/:id
 * @desc    Lấy chi tiết đề thi
 * @access  Private
 */
router.get(
  '/:id',
  examIdValidator,
  ValidationMiddleware.validate,
  ExamController.getExamById
);

/**
 * @route   POST /api/exams
 * @desc    Tạo đề thi mới
 * @access  Teacher, Admin
 */
router.post(
  '/',
  AuthMiddleware.authorize(ROLES.TEACHER, ROLES.ADMIN),
  createExamValidator,
  ValidationMiddleware.validate,
  ExamController.createExam
);

/**
 * @route   PUT /api/exams/:id
 * @desc    Cập nhật đề thi
 * @access  Teacher (owner), Admin
 */
router.put(
  '/:id',
  AuthMiddleware.authorize(ROLES.TEACHER, ROLES.ADMIN),
  examIdValidator,
  ValidationMiddleware.validate,
  ExamController.updateExam
);

/**
 * @route   DELETE /api/exams/:id
 * @desc    Xóa đề thi
 * @access  Teacher (owner), Admin
 */
router.delete(
  '/:id',
  AuthMiddleware.authorize(ROLES.TEACHER, ROLES.ADMIN),
  examIdValidator,
  ValidationMiddleware.validate,
  ExamController.deleteExam
);

module.exports = router;

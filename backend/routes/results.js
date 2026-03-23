// =====================================================
// RESULT ROUTES - QUẢN LÝ KẾT QUẢ THI (OOP)
// =====================================================

const express = require('express');
const router = express.Router();

const ResultController = require('../controllers/resultController');
const AuthMiddleware = require('../middleware/auth');
const ValidationMiddleware = require('../middleware/validate');
const { submitExamValidator, resultIdValidator } = require('../validators/resultValidator');
const { ROLES } = require('../utils/constants');

// ===== PROTECTED ROUTES =====
router.use(AuthMiddleware.authenticate);

/**
 * @route   POST /api/results/submit
 * @desc    Nộp bài thi
 * @access  Student
 */
router.post(
  '/submit',
  AuthMiddleware.authorize(ROLES.STUDENT),
  submitExamValidator,
  ValidationMiddleware.validate,
  ResultController.submitExam
);

/**
 * @route   GET /api/results/my-results
 * @desc    Lấy kết quả của student
 * @access  Student
 */
router.get(
  '/my-results',
  AuthMiddleware.authorize(ROLES.STUDENT),
  ResultController.getMyResults
);

/**
 * @route   GET /api/results/:id
 * @desc    Lấy chi tiết 1 kết quả
 * @access  Owner, Teacher, Admin
 */
router.get(
  '/:id',
  resultIdValidator,
  ValidationMiddleware.validate,
  ResultController.getResultById
);

/**
 * @route   GET /api/results/room/:roomId
 * @desc    Lấy kết quả của 1 phòng thi
 * @access  Teacher (owner), Admin
 */
router.get(
  '/room/:roomId',
  AuthMiddleware.authorize(ROLES.TEACHER, ROLES.ADMIN),
  ResultController.getResultsByRoom
);

/**
 * @route   GET /api/results/teacher/all
 * @desc    Lấy tất cả kết quả từ các phòng của teacher
 * @access  Teacher, Admin
 */
router.get(
  '/teacher/all',
  AuthMiddleware.authorize(ROLES.TEACHER, ROLES.ADMIN),
  ResultController.getAllTeacherResults
);

/**
 * @route   DELETE /api/results/:id
 * @desc    Xóa kết quả
 * @access  Admin only
 */
router.delete(
  '/:id',
  AuthMiddleware.authorize(ROLES.ADMIN),
  resultIdValidator,
  ValidationMiddleware.validate,
  ResultController.deleteResult
);

module.exports = router;

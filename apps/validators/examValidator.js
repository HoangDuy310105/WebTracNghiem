// =====================================================
// EXAM VALIDATORS - KIỂM TRA DỮ LIỆU ĐỀ THI
// =====================================================

const { body, param } = require('express-validator');

const createExamValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Tên đề thi không được để trống')
    .isLength({ min: 2, max: 200 }).withMessage('Tên đề thi phải từ 2-200 ký tự'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Mô tả không quá 500 ký tự'),
  
  body('duration')
    .notEmpty().withMessage('Thời gian làm bài không được để trống')
    .isInt({ min: 5, max: 300 }).withMessage('Thời gian phải từ 5-300 phút'),
  
  body('questions')
    .isArray({ min: 1 }).withMessage('Đề thi phải có ít nhất 1 câu hỏi'),
  
  body('questions.*.question')
    .trim()
    .notEmpty().withMessage('Nội dung câu hỏi không được để trống'),
  
  body('questions.*.optionA')
    .trim()
    .notEmpty().withMessage('Đáp án A không được để trống'),
  
  body('questions.*.optionB')
    .trim()
    .notEmpty().withMessage('Đáp án B không được để trống'),
  
  body('questions.*.optionC')
    .optional({ checkFalsy: true })
    .trim(),
  
  body('questions.*.optionD')
    .optional({ checkFalsy: true })
    .trim(),
  
  body('questions.*.correctAnswer')
    .notEmpty().withMessage('Đáp án đúng không được để trống')
    .isIn(['A', 'B', 'C', 'D']).withMessage('Đáp án đúng phải là A, B, C hoặc D')
];

const examIdValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID đề thi không hợp lệ')
];

module.exports = {
  createExamValidator,
  examIdValidator
};

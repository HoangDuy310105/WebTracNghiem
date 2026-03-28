// =====================================================
// RESULT VALIDATORS - KIỂM TRA DỮ LIỆU KẾT QUẢ
// =====================================================

const { body, param } = require('express-validator');

const submitExamValidator = [
  body('roomId')
    .notEmpty().withMessage('ID phòng thi không được để trống')
    .isInt({ min: 1 }).withMessage('ID phòng thi không hợp lệ'),
  
  body('answers')
    .isArray({ min: 1 }).withMessage('Câu trả lời phải là một mảng')
    .notEmpty().withMessage('Phải có ít nhất 1 câu trả lời'),
  
  body('answers.*.questionId')
    .notEmpty().withMessage('ID câu hỏi không được để trống')
    .isInt({ min: 1 }).withMessage('ID câu hỏi không hợp lệ'),
  
  body('answers.*.selectedAnswer')
    .notEmpty().withMessage('Đáp án được chọn không được để trống')
    .isIn(['A', 'B', 'C', 'D']).withMessage('Đáp án phải là A, B, C hoặc D')
];

const resultIdValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID kết quả không hợp lệ')
];

module.exports = {
  submitExamValidator,
  resultIdValidator
};

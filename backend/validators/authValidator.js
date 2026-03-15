// =====================================================
// AUTH VALIDATORS - KIỂM TRA DỮ LIỆU ĐĂNG KÝ/ĐĂNG NHẬP
// =====================================================

const { body } = require('express-validator');

const registerValidator = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Họ tên không được để trống')
    .isLength({ min: 2, max: 100 }).withMessage('Họ tên phải từ 2-100 ký tự'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email không được để trống')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Mật khẩu không được để trống')
    .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  
  body('role')
    .notEmpty().withMessage('Vai trò không được để trống')
    .isIn(['student', 'teacher', 'admin']).withMessage('Vai trò không hợp lệ')
];

const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email không được để trống')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Mật khẩu không được để trống')
];

module.exports = {
  registerValidator,
  loginValidator
};

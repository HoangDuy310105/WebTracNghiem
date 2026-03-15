// =====================================================
// ROOM VALIDATORS - KIỂM TRA DỮ LIỆU PHÒNG THI
// =====================================================

const { body, param } = require('express-validator');

const createRoomValidator = [
  body('examId')
    .notEmpty().withMessage('Đề thi không được để trống')
    .isInt({ min: 1 }).withMessage('ID đề thi không hợp lệ'),
  
  body('startTime')
    .notEmpty().withMessage('Thời gian bắt đầu không được để trống')
    .isISO8601().withMessage('Thời gian bắt đầu không hợp lệ'),
  
  body('endTime')
    .notEmpty().withMessage('Thời gian kết thúc không được để trống')
    .isISO8601().withMessage('Thời gian kết thúc không hợp lệ')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startTime)) {
        throw new Error('Thời gian kết thúc phải sau thời gian bắt đầu');
      }
      return true;
    })
];

const joinRoomValidator = [
  body('roomCode')
    .trim()
    .notEmpty().withMessage('Mã phòng thi không được để trống')
    .isLength({ min: 6, max: 6 }).withMessage('Mã phòng thi phải có 6 ký tự')
    .isAlphanumeric().withMessage('Mã phòng thi chỉ chứa chữ và số')
];

const roomIdValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID phòng thi không hợp lệ')
];

module.exports = {
  createRoomValidator,
  joinRoomValidator,
  roomIdValidator
};

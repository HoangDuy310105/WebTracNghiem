// =====================================================
// CONSTANTS - ĐỊNH NGHĨA CÁC HẰNG SỐ HỆ THỐNG
// =====================================================

module.exports = {
  // User Roles
  ROLES: {
    STUDENT: 'student',
    TEACHER: 'teacher',
    ADMIN: 'admin'
  },

  // Exam Room Status
  ROOM_STATUS: {
    PENDING: 'pending',      // Chưa bắt đầu
    ACTIVE: 'active',        // Đang diễn ra
    COMPLETED: 'completed',  // Đã kết thúc
    CANCELLED: 'cancelled'   // Đã hủy
  },

  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500
  },

  // Response Messages
  MESSAGES: {
    SUCCESS: 'Thành công',
    ERROR: 'Có lỗi xảy ra',
    UNAUTHORIZED: 'Chưa đăng nhập',
    FORBIDDEN: 'Không có quyền truy cập',
    NOT_FOUND: 'Không tìm thấy',
    VALIDATION_ERROR: 'Dữ liệu không hợp lệ',
    
    // Auth
    LOGIN_SUCCESS: 'Đăng nhập thành công',
    LOGIN_FAILED: 'Email hoặc mật khẩu không đúng',
    REGISTER_SUCCESS: 'Đăng ký thành công',
    EMAIL_EXISTS: 'Email đã tồn tại',
    
    // Exam
    EXAM_CREATED: 'Tạo đề thi thành công',
    EXAM_UPDATED: 'Cập nhật đề thi thành công',
    EXAM_DELETED: 'Xóa đề thi thành công',
    EXAM_NOT_FOUND: 'Không tìm thấy đề thi',
    
    // Room
    ROOM_CREATED: 'Tạo phòng thi thành công',
    ROOM_NOT_FOUND: 'Không tìm thấy phòng thi',
    ROOM_CODE_INVALID: 'Mã phòng thi không hợp lệ',
    ROOM_EXPIRED: 'Phòng thi đã hết hạn',
    ALREADY_SUBMITTED: 'Bạn đã nộp bài cho phòng thi này',
    
    // Result
    SUBMIT_SUCCESS: 'Nộp bài thành công',
    RESULT_NOT_FOUND: 'Không tìm thấy kết quả'
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
  },

  // JWT
  JWT: {
    EXPIRES_IN: '1d',
    REFRESH_EXPIRES_IN: '30d'
  },

  // Cache TTL (seconds)
  CACHE_TTL: {
    SHORT: 300,      // 5 minutes
    MEDIUM: 1800,    // 30 minutes
    LONG: 3600       // 1 hour
  }
};

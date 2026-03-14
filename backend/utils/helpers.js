// =====================================================
// HELPERS CLASS - CÁC HÀM TRỢ GIÚP DÙNG CHUNG (OOP)
// =====================================================

const bcrypt = require('bcryptjs');

class HelperUtils {
  /**
   * Hash password
   */
  static async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  /**
   * Compare password
   */
  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  /**
   * Generate random code (cho room code)
   */
  static generateCode(length = 6) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  }

  /**
   * Calculate exam score
   */
  static calculateScore(correctAnswers, totalQuestions) {
    if (totalQuestions === 0) return 0;
    return Math.round((correctAnswers / totalQuestions) * 10 * 100) / 100;
  }

  /**
   * Format date to Vietnamese
   */
  static formatDate(date) {
    return new Date(date).toLocaleString('vi-VN');
  }

  /**
   * Pagination helper
   */
  static getPagination(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    return { offset, limit: parseInt(limit) };
  }

  /**
   * Success response format
   */
  static successResponse(message, data = null) {
    return {
      success: true,
      message,
      data
    };
  }

  /**
   * Error response format
   */
  static errorResponse(message, errors = null) {
    return {
      success: false,
      message,
      errors
    };
  }

  /**
   * Check if date is expired
   */
  static isExpired(date) {
    return new Date(date) < new Date();
  }

  /**
   * Generate slug from text
   */
  static generateSlug(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}

module.exports = HelperUtils;

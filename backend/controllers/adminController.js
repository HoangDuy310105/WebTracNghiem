// =====================================================
// ADMIN CONTROLLER CLASS - HTTP handler (thin), gọi AdminService
// =====================================================

const { HTTP_STATUS, MESSAGES } = require('../utils/constants');
const HelperUtils = require('../utils/helpers');
const Logger = require('../utils/logger');
const AdminService = require('../Services/AdminService');

const TYPE_TO_STATUS = {
  CONFLICT: HTTP_STATUS.CONFLICT,
  UNAUTHORIZED: HTTP_STATUS.UNAUTHORIZED,
  FORBIDDEN: HTTP_STATUS.FORBIDDEN,
  NOT_FOUND: HTTP_STATUS.NOT_FOUND,
  BAD_REQUEST: HTTP_STATUS.BAD_REQUEST
};

class AdminController {
  /**
   * Lấy dashboard statistics
   * GET /api/admin/stats
   */
  static async getStats(req, res) {
    try {
      const data = await AdminService.getStats();
      res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse('Thành công', data));
    } catch (error) {
      Logger.error('Get stats error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
  }

  /**
   * Lấy danh sách users
   * GET /api/admin/users
   */
  static async getUsers(req, res) {
    try {
      const { page = 1, limit = 10, role, search } = req.query;
      const data = await AdminService.getUsers({ page, limit, role, search });
      res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse('Thành công', data));
    } catch (error) {
      Logger.error('Get users error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
  }

  /**
   * Lấy chi tiết user
   * GET /api/admin/users/:id
   */
  static async getUserById(req, res) {
    try {
      const user = await AdminService.getUserById(req.params.id);
      res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse('Thành công', user));
    } catch (error) {
      if (error.type) {
        return res.status(TYPE_TO_STATUS[error.type] || HTTP_STATUS.BAD_REQUEST).json(
          HelperUtils.errorResponse(error.message)
        );
      }
      Logger.error('Get user by id error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
  }

  /**
   * Cập nhật user
   * PUT /api/admin/users/:id
   */
  static async updateUser(req, res) {
    try {
      await AdminService.updateUser(req.params.id, req.body, req.user.id);
      res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse('Cập nhật user thành công'));
    } catch (error) {
      if (error.type) {
        return res.status(TYPE_TO_STATUS[error.type] || HTTP_STATUS.BAD_REQUEST).json(
          HelperUtils.errorResponse(error.message)
        );
      }
      Logger.error('Update user error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
  }

  /**
   * Xóa user
   * DELETE /api/admin/users/:id
   */
  static async deleteUser(req, res) {
    try {
      await AdminService.deleteUser(req.params.id, req.user.id);
      res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse('Xóa user thành công'));
    } catch (error) {
      if (error.type) {
        return res.status(TYPE_TO_STATUS[error.type] || HTTP_STATUS.BAD_REQUEST).json(
          HelperUtils.errorResponse(error.message)
        );
      }
      Logger.error('Delete user error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
  }

  /**
   * Tạo user mới (admin tạo cho teacher hoặc student)
   * POST /api/admin/users
   */
  static async createUser(req, res) {
    try {
      const data = await AdminService.createUser(req.body, req.user.id);
      res.status(HTTP_STATUS.CREATED).json(HelperUtils.successResponse('Tạo user thành công', data));
    } catch (error) {
      if (error.type) {
        return res.status(TYPE_TO_STATUS[error.type] || HTTP_STATUS.BAD_REQUEST).json(
          HelperUtils.errorResponse(error.message)
        );
      }
      Logger.error('Create user error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
  }

  /**
   * Lấy tất cả đề thi (Admin xem toàn hệ thống)
   * GET /api/admin/exams
   */
  static async getAdminExams(req, res) {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const data = await AdminService.getAdminExams({ page, limit, search });
      res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse('Thành công', data));
    } catch (error) {
      Logger.error('Get admin exams error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
  }

  /**
   * Xóa đề thi (Admin)
   * DELETE /api/admin/exams/:id
   */
  static async deleteAdminExam(req, res) {
    try {
      await AdminService.deleteAdminExam(req.params.id, req.user.id);
      res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse('Xóa đề thi thành công'));
    } catch (error) {
      if (error.type) {
        return res.status(TYPE_TO_STATUS[error.type] || HTTP_STATUS.BAD_REQUEST).json(
          HelperUtils.errorResponse(error.message)
        );
      }
      Logger.error('Delete admin exam error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
  }

  /**
   * Lấy tất cả phòng thi (Admin)
   * GET /api/admin/rooms
   */
  static async getAdminRooms(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const data = await AdminService.getAdminRooms({ page, limit });
      res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse('Thành công', data));
    } catch (error) {
      Logger.error('Get admin rooms error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
  }

  /**
   * Lấy tất cả kết quả thi (Admin)
   * GET /api/admin/results
   */
  static async getAdminResults(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const data = await AdminService.getAdminResults({ page, limit });
      res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse('Thành công', data));
    } catch (error) {
      Logger.error('Get admin results error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
  }

  /**
   * Toggle active status
   * PATCH /api/admin/users/:id/toggle-active
   */
  static async toggleUserActive(req, res) {
    try {
      const isActive = await AdminService.toggleUserActive(req.params.id);
      res.status(HTTP_STATUS.OK).json(
        HelperUtils.successResponse(`User ${isActive ? 'kích hoạt' : 'khóa'} thành công`)
      );
    } catch (error) {
      if (error.type) {
        return res.status(TYPE_TO_STATUS[error.type] || HTTP_STATUS.BAD_REQUEST).json(
          HelperUtils.errorResponse(error.message)
        );
      }
      Logger.error('Toggle user active error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
  }
}

module.exports = AdminController;

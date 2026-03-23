// =====================================================
// EXAM CONTROLLER CLASS - HTTP handler (thin), gọi ExamService
// =====================================================

const { HTTP_STATUS, MESSAGES } = require('../utils/constants');
const HelperUtils = require('../utils/helpers');
const Logger = require('../utils/logger');
const ExamService = require('../Services/ExamService');

const TYPE_TO_STATUS = {
  CONFLICT: HTTP_STATUS.CONFLICT,
  UNAUTHORIZED: HTTP_STATUS.UNAUTHORIZED,
  FORBIDDEN: HTTP_STATUS.FORBIDDEN,
  NOT_FOUND: HTTP_STATUS.NOT_FOUND,
  BAD_REQUEST: HTTP_STATUS.BAD_REQUEST
};

class ExamController {
  /**
   * Lấy danh sách đề thi
   * GET /api/exams
   */
  static async getExams(req, res) {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const data = await ExamService.getExams({ page, limit, search, user: req.user });
      res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse('Thành công', data));
    } catch (error) {
      if (error.type) {
        return res.status(TYPE_TO_STATUS[error.type] || HTTP_STATUS.BAD_REQUEST).json(
          HelperUtils.errorResponse(error.message)
        );
      }
      Logger.error('Get exams error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
  }

  /**
   * Lấy chi tiết đề thi
   * GET /api/exams/:id
   */
  static async getExamById(req, res) {
    try {
      const exam = await ExamService.getExamById(req.params.id);
      res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse('Thành công', exam));
    } catch (error) {
      if (error.type) {
        return res.status(TYPE_TO_STATUS[error.type] || HTTP_STATUS.BAD_REQUEST).json(
          HelperUtils.errorResponse(error.message)
        );
      }
      Logger.error('Get exam by id error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
  }

  /**
   * Tạo đề thi mới
   * POST /api/exams
   */
  static async createExam(req, res) {
    try {
      const data = await ExamService.createExam(req.body, req.user.id);
      res.status(HTTP_STATUS.CREATED).json(HelperUtils.successResponse(MESSAGES.EXAM_CREATED, data));
    } catch (error) {
      if (error.type) {
        return res.status(TYPE_TO_STATUS[error.type] || HTTP_STATUS.BAD_REQUEST).json(
          HelperUtils.errorResponse(error.message)
        );
      }
      Logger.error('Create exam error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        HelperUtils.errorResponse(error.message || MESSAGES.ERROR)
      );
    }
  }

  /**
   * Cập nhật đề thi
   * PUT /api/exams/:id
   */
  static async updateExam(req, res) {
    try {
      await ExamService.updateExam(req.params.id, req.body, req.user);
      res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse(MESSAGES.EXAM_UPDATED));
    } catch (error) {
      if (error.type) {
        return res.status(TYPE_TO_STATUS[error.type] || HTTP_STATUS.BAD_REQUEST).json(
          HelperUtils.errorResponse(error.message)
        );
      }
      Logger.error('Update exam error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
  }

  /**
   * Xóa đề thi
   * DELETE /api/exams/:id
   */
  static async deleteExam(req, res) {
    try {
      await ExamService.deleteExam(req.params.id, req.user);
      res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse(MESSAGES.EXAM_DELETED));
    } catch (error) {
      if (error.type) {
        return res.status(TYPE_TO_STATUS[error.type] || HTTP_STATUS.BAD_REQUEST).json(
          HelperUtils.errorResponse(error.message)
        );
      }
      Logger.error('Delete exam error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
  }
}

module.exports = ExamController;


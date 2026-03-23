// =====================================================
// RESULT CONTROLLER CLASS - HTTP handler (thin), gọi ResultService
// =====================================================

const { HTTP_STATUS, MESSAGES } = require('../utils/constants');
const HelperUtils = require('../utils/helpers');
const Logger = require('../utils/logger');
const ResultService = require('../Services/ResultService');

const TYPE_TO_STATUS = {
  CONFLICT: HTTP_STATUS.CONFLICT,
  UNAUTHORIZED: HTTP_STATUS.UNAUTHORIZED,
  FORBIDDEN: HTTP_STATUS.FORBIDDEN,
  NOT_FOUND: HTTP_STATUS.NOT_FOUND,
  BAD_REQUEST: HTTP_STATUS.BAD_REQUEST
};

class ResultController {
  /**
   * Nộp bài thi
   * POST /api/results/submit
   */
  static async submitExam(req, res) {
    try {
      const data = await ResultService.submitExam(req.body, req.user.id);
      res.status(HTTP_STATUS.CREATED).json(HelperUtils.successResponse('Nộp bài thành công', data));
    } catch (error) {
      if (error.type) {
        return res.status(TYPE_TO_STATUS[error.type] || HTTP_STATUS.BAD_REQUEST).json(
          HelperUtils.errorResponse(error.message)
        );
      }
      Logger.error('Submit exam error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
  }

  /**
   * Lấy kết quả của student
   * GET /api/results/my-results
   */
  static async getMyResults(req, res) {
    try {
      const data = await ResultService.getMyResults(req.user.id);
      res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse('Thành công', data));
    } catch (error) {
      if (error.type) {
        return res.status(TYPE_TO_STATUS[error.type] || HTTP_STATUS.BAD_REQUEST).json(
          HelperUtils.errorResponse(error.message)
        );
      }
      Logger.error('Get my results error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        HelperUtils.errorResponse('Lỗi: ' + error.message)
      );
    }
  }

  /**
   * Lấy chi tiết 1 kết quả
   * GET /api/results/:id
   */
  static async getResultById(req, res) {
    try {
      const result = await ResultService.getResultById(req.params.id, req.user);
      res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse('Thành công', result));
    } catch (error) {
      if (error.type) {
        return res.status(TYPE_TO_STATUS[error.type] || HTTP_STATUS.BAD_REQUEST).json(
          HelperUtils.errorResponse(error.message)
        );
      }
      Logger.error('Get result by id error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
  }

  /**
   * Lấy kết quả của 1 phòng thi (cho teacher)
   * GET /api/results/room/:roomId
   */
  static async getResultsByRoom(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const data = await ResultService.getResultsByRoom(req.params.roomId, { page, limit }, req.user);
      res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse('Thành công', data));
    } catch (error) {
      if (error.type) {
        return res.status(TYPE_TO_STATUS[error.type] || HTTP_STATUS.BAD_REQUEST).json(
          HelperUtils.errorResponse(error.message)
        );
      }
      Logger.error('Get results by room error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
  }

  /**
   * Lấy tất cả kết quả từ các phòng của teacher
   * GET /api/results/teacher/all
   */
  static async getAllTeacherResults(req, res) {
    try {
      const results = await Result.findAll({
        include: [
          {
            model: User,
            as: 'student',
            attributes: ['id', 'fullName', 'email']
          },
          {
            model: ExamRoom,
            as: 'room',
            where: { createdBy: req.user.id },
            include: [
              {
                model: Exam,
                as: 'exam',
                attributes: ['id', 'title']
              }
            ]
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.status(HTTP_STATUS.OK).json(
        HelperUtils.successResponse('Thành công', results)
      );
    } catch (error) {
      Logger.error('Get all teacher results error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        HelperUtils.errorResponse(MESSAGES.ERROR)
      );
    }
  }

  /**
   * Xóa kết quả (chỉ admin)
   * DELETE /api/results/:id
   */
  static async deleteResult(req, res) {
    try {
      await ResultService.deleteResult(req.params.id);
      res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse(MESSAGES.RESULT_DELETED));
    } catch (error) {
      if (error.type) {
        return res.status(TYPE_TO_STATUS[error.type] || HTTP_STATUS.BAD_REQUEST).json(
          HelperUtils.errorResponse(error.message)
        );
      }
      Logger.error('Delete result error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
  }
}

module.exports = ResultController;

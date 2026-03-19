// =====================================================
// RESULT CONTROLLER CLASS - QUẢN LÝ KẾT QUẢ THI (OOP)
// =====================================================

const { Result, ExamRoom, Exam, Question, User } = require('../models');
const { HTTP_STATUS, MESSAGES } = require('../utils/constants');
const HelperUtils = require('../utils/helpers');
const Logger = require('../utils/logger');

class ResultController {
  /**
   * Nộp bài thi
   * POST /api/results/submit
   */
  static async submitExam(req, res) {
    try {
      const { roomId, answers } = req.body; // answers: [{questionId, answer}]

      // Kiểm tra phòng thi
      const room = await ExamRoom.findByPk(roomId, {
        include: [{ model: Exam, as: 'exam', include: [{ model: Question, as: 'questions' }] }]
      });

      if (!room) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          HelperUtils.errorResponse(MESSAGES.ROOM_NOT_FOUND)
        );
      }

      // Kiểm tra đã nộp bài chưa
      const existingResult = await Result.findOne({
        where: { studentId: req.user.id, roomId }
      });

      if (existingResult) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          HelperUtils.errorResponse('Bạn đã nộp bài thi này rồi')
        );
      }

      // Tính điểm
      const questions = room.exam.questions;
      const { correctAnswers, score } = HelperUtils.calculateScore(
        answers,
        questions
      );

      // Lưu kết quả
      const result = await Result.create({
        studentId: req.user.id,
        roomId,
        answers: JSON.stringify(answers),
        correctAnswers,
        score,
        totalQuestions: questions.length
      });

      Logger.info(`Exam submitted: student ${req.user.id}, room ${roomId}, score ${score}`);

      res.status(HTTP_STATUS.CREATED).json(
        HelperUtils.successResponse('Nộp bài thành công', {
          resultId: result.id,
          score: result.score,
          correctAnswers: result.correctAnswers,
          totalQuestions: result.totalQuestions
        })
      );
    } catch (error) {
      Logger.error('Submit exam error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        HelperUtils.errorResponse(MESSAGES.ERROR)
      );
    }
  }

  /**
   * Lấy kết quả của student
   * GET /api/results/my-results
   */
  static async getMyResults(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const { offset, limit: pageLimit } = HelperUtils.getPagination(page, limit);

      const { count, rows } = await Result.findAndCountAll({
        where: { studentId: req.user.id },
        include: [
          {
            model: ExamRoom,
            as: 'room',
            include: [
              {
                model: Exam,
                as: 'exam',
                attributes: ['id', 'title', 'duration', 'totalQuestions']
              }
            ]
          }
        ],
        offset,
        limit: pageLimit,
        order: [['createdAt', 'DESC']]
      });

      res.status(HTTP_STATUS.OK).json(
        HelperUtils.successResponse('Thành công', {
          results: rows,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: pageLimit,
            totalPages: Math.ceil(count / pageLimit)
          }
        })
      );
    } catch (error) {
      Logger.error('Get my results error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        HelperUtils.errorResponse(MESSAGES.ERROR)
      );
    }
  }

  /**
   * Lấy chi tiết 1 kết quả
   * GET /api/results/:id
   */
  static async getResultById(req, res) {
    try {
      const { id } = req.params;

      const result = await Result.findByPk(id, {
        include: [
          {
            model: User,
            as: 'student',
            attributes: ['id', 'fullName', 'email']
          },
          {
            model: ExamRoom,
            as: 'room',
            include: [
              {
                model: Exam,
                as: 'exam',
                attributes: ['id', 'title', 'duration', 'totalQuestions']
              }
            ]
          }
        ]
      });

      if (!result) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          HelperUtils.errorResponse(MESSAGES.RESULT_NOT_FOUND)
        );
      }

      // Kiểm tra quyền xem
      const isOwner = result.studentId === req.user.id;
      const isTeacher = req.user.role === 'teacher';
      const isAdmin = req.user.role === 'admin';

      if (!isOwner && !isTeacher && !isAdmin) {
        return res.status(HTTP_STATUS.FORBIDDEN).json(
          HelperUtils.errorResponse(MESSAGES.FORBIDDEN)
        );
      }

      res.status(HTTP_STATUS.OK).json(
        HelperUtils.successResponse('Thành công', result)
      );
    } catch (error) {
      Logger.error('Get result by id error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        HelperUtils.errorResponse(MESSAGES.ERROR)
      );
    }
  }

  /**
   * Lấy kết quả của 1 phòng thi (cho teacher)
   * GET /api/results/room/:roomId
   */
  static async getResultsByRoom(req, res) {
    try {
      const { roomId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const { offset, limit: pageLimit } = HelperUtils.getPagination(page, limit);

      const room = await ExamRoom.findByPk(roomId);
      if (!room) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          HelperUtils.errorResponse(MESSAGES.ROOM_NOT_FOUND)
        );
      }

      // Kiểm tra quyền
      if (room.createdBy !== req.user.id && req.user.role !== 'admin') {
        return res.status(HTTP_STATUS.FORBIDDEN).json(
          HelperUtils.errorResponse(MESSAGES.FORBIDDEN)
        );
      }

      const { count, rows } = await Result.findAndCountAll({
        where: { roomId },
        include: [
          {
            model: User,
            as: 'student',
            attributes: ['id', 'fullName', 'email']
          }
        ],
        offset,
        limit: pageLimit,
        order: [['score', 'DESC']]
      });

      res.status(HTTP_STATUS.OK).json(
        HelperUtils.successResponse('Thành công', {
          results: rows,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: pageLimit,
            totalPages: Math.ceil(count / pageLimit)
          }
        })
      );
    } catch (error) {
      Logger.error('Get results by room error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        HelperUtils.errorResponse(MESSAGES.ERROR)
      );
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
      const { id } = req.params;

      const result = await Result.findByPk(id);

      if (!result) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          HelperUtils.errorResponse(MESSAGES.RESULT_NOT_FOUND)
        );
      }

      await result.destroy();

      Logger.info(`Result deleted: ${id}`);

      res.status(HTTP_STATUS.OK).json(
        HelperUtils.successResponse(MESSAGES.RESULT_DELETED)
      );
    } catch (error) {
      Logger.error('Delete result error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        HelperUtils.errorResponse(MESSAGES.ERROR)
      );
    }
  }
}

module.exports = ResultController;

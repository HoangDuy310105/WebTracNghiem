// =====================================================
// EXAM CONTROLLER CLASS - QUẢN LÝ ĐỀ THI (OOP)
// =====================================================

const { Exam, Question, User } = require('../models');
const { HTTP_STATUS, MESSAGES } = require('../utils/constants');
const HelperUtils = require('../utils/helpers');
const Logger = require('../utils/logger');

class ExamController {
  /**
   * Lấy danh sách đề thi
   * GET /api/exams
   */
  static async getExams(req, res) {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const { offset, limit: pageLimit } = HelperUtils.getPagination(page, limit);

      const whereClause = {};
      
      // Nếu là teacher, chỉ lấy đề thi của mình
      if (req.user.role === 'teacher') {
        whereClause.teacherId = req.user.id;
      }

      // Tìm kiếm theo title
      if (search) {
        whereClause.title = { [require('sequelize').Op.like]: `%${search}%` };
      }

      const { count, rows } = await Exam.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'teacher',
            attributes: ['id', 'fullName', 'email']
          },
          {
            model: Question,
            as: 'questions',
            attributes: ['id']
          }
        ],
        offset,
        limit: pageLimit,
        order: [['createdAt', 'DESC']]
      });

      res.status(HTTP_STATUS.OK).json(
        HelperUtils.successResponse('Thành công', {
          exams: rows,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: pageLimit,
            totalPages: Math.ceil(count / pageLimit)
          }
        })
      );
    } catch (error) {
      Logger.error('Get exams error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        HelperUtils.errorResponse(MESSAGES.ERROR)
      );
    }
  }

  /**
   * Lấy chi tiết đề thi
   * GET /api/exams/:id
   */
  static async getExamById(req, res) {
    try {
      const { id } = req.params;

      const exam = await Exam.findByPk(id, {
        include: [
          {
            model: User,
            as: 'teacher',
            attributes: ['id', 'fullName', 'email']
          },
          {
            model: Question,
            as: 'questions',
            attributes: { exclude: ['correctAnswer'] } // Ẩn đáp án đúng khi xem
          }
        ]
      });

      if (!exam) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          HelperUtils.errorResponse(MESSAGES.EXAM_NOT_FOUND)
        );
      }

      res.status(HTTP_STATUS.OK).json(
        HelperUtils.successResponse('Thành công', exam)
      );
    } catch (error) {
      Logger.error('Get exam by id error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        HelperUtils.errorResponse(MESSAGES.ERROR)
      );
    }
  }

  /**
   * Tạo đề thi mới
   * POST /api/exams
   */
  static async createExam(req, res) {
    try {
      const { title, description, duration, questions } = req.body;

      // Tạo exam
      const exam = await Exam.create({
        title,
        description,
        duration,
        teacherId: req.user.id,
        totalQuestions: questions.length
      });

      // Tạo questions
      const questionData = questions.map((q, index) => ({
        examId: exam.id,
        question: q.question,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer,
        order: index + 1
      }));

      await Question.bulkCreate(questionData);

      Logger.info(`Exam created: ${exam.id} by teacher ${req.user.id}`);

      res.status(HTTP_STATUS.CREATED).json(
        HelperUtils.successResponse(MESSAGES.EXAM_CREATED, { examId: exam.id })
      );
    } catch (error) {
      Logger.error('Create exam error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        HelperUtils.errorResponse(MESSAGES.ERROR)
      );
    }
  }

  /**
   * Cập nhật đề thi
   * PUT /api/exams/:id
   */
  static async updateExam(req, res) {
    try {
      const { id } = req.params;
      const { title, description, duration } = req.body;

      const exam = await Exam.findByPk(id);

      if (!exam) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          HelperUtils.errorResponse(MESSAGES.EXAM_NOT_FOUND)
        );
      }

      // Kiểm tra quyền sở hữu
      if (exam.teacherId !== req.user.id && req.user.role !== 'admin') {
        return res.status(HTTP_STATUS.FORBIDDEN).json(
          HelperUtils.errorResponse(MESSAGES.FORBIDDEN)
        );
      }

      // Cập nhật
      await exam.update({ title, description, duration });

      res.status(HTTP_STATUS.OK).json(
        HelperUtils.successResponse(MESSAGES.EXAM_UPDATED)
      );
    } catch (error) {
      Logger.error('Update exam error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        HelperUtils.errorResponse(MESSAGES.ERROR)
      );
    }
  }

  /**
   * Xóa đề thi
   * DELETE /api/exams/:id
   */
  static async deleteExam(req, res) {
    try {
      const { id } = req.params;

      const exam = await Exam.findByPk(id);

      if (!exam) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          HelperUtils.errorResponse(MESSAGES.EXAM_NOT_FOUND)
        );
      }

      // Kiểm tra quyền sở hữu
      if (exam.teacherId !== req.user.id && req.user.role !== 'admin') {
        return res.status(HTTP_STATUS.FORBIDDEN).json(
          HelperUtils.errorResponse(MESSAGES.FORBIDDEN)
        );
      }

      await exam.destroy();

      Logger.info(`Exam deleted: ${id}`);

      res.status(HTTP_STATUS.OK).json(
        HelperUtils.successResponse(MESSAGES.EXAM_DELETED)
      );
    } catch (error) {
      Logger.error('Delete exam error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        HelperUtils.errorResponse(MESSAGES.ERROR)
      );
    }
  }
}

module.exports = ExamController;

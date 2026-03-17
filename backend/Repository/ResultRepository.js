// =====================================================
// RESULT REPOSITORY - Data Access Layer cho Result
// =====================================================

const { Result, ExamRoom, Exam, User } = require('../models');
const HelperUtils = require('../utils/helpers');

class ResultRepository {
  static async findById(id) {
    return Result.findByPk(id, {
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
            { model: Exam, as: 'exam', attributes: ['id', 'title', 'duration', 'totalQuestions'] }
          ]
        }
      ]
    });
  }

  static async findByStudentAndRoom(studentId, roomId) {
    return Result.findOne({ where: { studentId, roomId } });
  }

  static async findByStudent(studentId) {
    return Result.findAll({
      where: { studentId },
      include: [
        {
          model: ExamRoom,
          as: 'room',
          include: [
            { model: Exam, as: 'exam', attributes: ['id', 'title', 'duration', 'totalQuestions'] }
          ]
        }
      ],
      order: [['submittedAt', 'DESC']]
    });
  }

  static async findByRoom(roomId, { page = 1, limit = 20 } = {}) {
    const { offset, limit: pageLimit } = HelperUtils.getPagination(page, limit);
    return Result.findAndCountAll({
      where: { roomId },
      include: [
        { model: User, as: 'student', attributes: ['id', 'fullName', 'email'] }
      ],
      offset,
      limit: pageLimit,
      order: [['score', 'DESC']]
    });
  }

  static async create(data) {
    return Result.create(data);
  }

  static async delete(instance) {
    return instance.destroy();
  }

  static async count() {
    return Result.count();
  }

  static async getRecent(limit = 5) {
    return Result.findAll({
      limit,
      include: [
        { model: User, as: 'student', attributes: ['fullName', 'email'] },
        {
          model: ExamRoom,
          as: 'room',
          include: [{ model: Exam, as: 'exam', attributes: ['title'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  }
}

module.exports = ResultRepository;

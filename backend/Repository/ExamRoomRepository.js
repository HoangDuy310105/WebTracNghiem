// =====================================================
// EXAM ROOM REPOSITORY - Data Access Layer cho ExamRoom
// =====================================================

const { ExamRoom, Exam, Question, User, Result } = require('../models');
const HelperUtils = require('../utils/helpers');

class ExamRoomRepository {
  static async findById(id) {
    return ExamRoom.findByPk(id);
  }

  static async findByIdWithDetails(id) {
    return ExamRoom.findByPk(id, {
      include: [
        {
          model: Exam,
          as: 'exam',
          attributes: ['id', 'title', 'description', 'duration', 'totalQuestions']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'fullName', 'email']
        },
        {
          model: Result,
          as: 'results',
          include: [
            { model: User, as: 'student', attributes: ['id', 'fullName', 'email'] }
          ]
        }
      ]
    });
  }

  // Dùng khi nộp bài: cần lấy exam + questions để tính điểm
  static async findByIdWithExamAndQuestions(id) {
    return ExamRoom.findByPk(id, {
      include: [
        {
          model: Exam,
          as: 'exam',
          include: [{ model: Question, as: 'questions' }]
        }
      ]
    });
  }

  static async findByCode(roomCode) {
    return ExamRoom.findOne({
      where: { roomCode },
      include: [{ model: Exam, as: 'exam' }]
    });
  }

  static async findOneByCode(roomCode) {
    return ExamRoom.findOne({ where: { roomCode } });
  }

  static async getList({ page = 1, limit = 10, createdBy = null, status = null } = {}) {
    const { offset, limit: pageLimit } = HelperUtils.getPagination(page, limit);
    const whereClause = {};

    if (createdBy) whereClause.createdBy = createdBy;
    if (status) whereClause.status = status;

    return ExamRoom.findAndCountAll({
      where: whereClause,
      include: [
        { model: Exam, as: 'exam', attributes: ['id', 'title', 'duration', 'totalQuestions'] },
        { model: User, as: 'creator', attributes: ['id', 'fullName', 'email'] }
      ],
      offset,
      limit: pageLimit,
      order: [['createdAt', 'DESC']]
    });
  }

  static async getAdminList({ page = 1, limit = 20 } = {}) {
    const { offset, limit: pageLimit } = HelperUtils.getPagination(page, limit);
    return ExamRoom.findAndCountAll({
      include: [
        { model: Exam, as: 'exam', attributes: ['id', 'title', 'duration'] },
        { model: User, as: 'creator', attributes: ['id', 'fullName', 'email'] }
      ],
      offset,
      limit: pageLimit,
      order: [['createdAt', 'DESC']]
    });
  }

  static async create(data) {
    return ExamRoom.create(data);
  }

  static async update(instance, data) {
    return instance.update(data);
  }

  static async updateById(id, data) {
    return ExamRoom.update(data, { where: { id } });
  }

  static async delete(instance) {
    return instance.destroy();
  }

  static async count(whereClause = {}) {
    return ExamRoom.count({ where: whereClause });
  }
}

module.exports = ExamRoomRepository;

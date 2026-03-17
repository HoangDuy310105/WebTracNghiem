// =====================================================
// EXAM REPOSITORY - Data Access Layer cho Exam
// =====================================================

const { Exam, Question, User } = require('../models');
const { Op } = require('sequelize');
const HelperUtils = require('../utils/helpers');

class ExamRepository {
  static async findById(id) {
    return Exam.findByPk(id);
  }

  static async findByIdWithDetails(id) {
    return Exam.findByPk(id, {
      include: [
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'fullName', 'email']
        },
        {
          model: Question,
          as: 'questions',
          attributes: { exclude: ['correctAnswer'] }
        }
      ]
    });
  }

  static async getList({ page = 1, limit = 10, search = '', teacherId = null } = {}) {
    const { offset, limit: pageLimit } = HelperUtils.getPagination(page, limit);
    const whereClause = {};

    if (teacherId) whereClause.teacherId = teacherId;
    if (search) whereClause.title = { [Op.like]: `%${search}%` };

    return Exam.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'teacher', attributes: ['id', 'fullName', 'email'] },
        { model: Question, as: 'questions', attributes: ['id'] }
      ],
      offset,
      limit: pageLimit,
      order: [['createdAt', 'DESC']]
    });
  }

  static async create(data) {
    return Exam.create(data);
  }

  static async update(instance, data) {
    return instance.update(data);
  }

  static async delete(instance) {
    return instance.destroy();
  }

  static async count() {
    return Exam.count();
  }
}

module.exports = ExamRepository;

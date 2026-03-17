// =====================================================
// USER REPOSITORY - Data Access Layer cho User
// =====================================================

const { User, Exam, Result } = require('../models');
const { Op } = require('sequelize');
const HelperUtils = require('../utils/helpers');

class UserRepository {
  static async findByEmail(email) {
    return User.findOne({ where: { email } });
  }

  static async findById(id, options = {}) {
    return User.findByPk(id, options);
  }

  static async findByIdWithDetails(id) {
    return User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        { model: Exam, as: 'exams', attributes: ['id', 'title', 'createdAt'] },
        { model: Result, as: 'results', attributes: ['id', 'score', 'createdAt'] }
      ]
    });
  }

  static async create(data) {
    return User.create(data);
  }

  static async update(instance, data) {
    return instance.update(data);
  }

  static async delete(instance) {
    return instance.destroy();
  }

  static async getList({ page = 1, limit = 10, role, search } = {}) {
    const { offset, limit: pageLimit } = HelperUtils.getPagination(page, limit);
    const whereClause = {};

    if (role) whereClause.role = role;
    if (search) {
      whereClause[Op.or] = [
        { fullName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    return User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      offset,
      limit: pageLimit,
      order: [['createdAt', 'DESC']]
    });
  }

  static async count(whereClause = {}) {
    return User.count({ where: whereClause });
  }
}

module.exports = UserRepository;

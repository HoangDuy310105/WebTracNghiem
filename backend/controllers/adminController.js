// =====================================================
// ADMIN CONTROLLER CLASS - QUẢN TRỊ HỆ THỐNG (OOP)
// =====================================================

const { User, Exam, ExamRoom, Result } = require('../models');
const { HTTP_STATUS, MESSAGES, ROLES } = require('../utils/constants');
const HelperUtils = require('../utils/helpers');
const Logger = require('../utils/logger');
const { Op } = require('sequelize');

class AdminController {
  /**
   * Lấy dashboard statistics
   * GET /api/admin/stats
   */
  static async getStats(req, res) {
    try {
      const totalUsers = await User.count();
      const totalStudents = await User.count({ where: { role: ROLES.STUDENT } });
      const totalTeachers = await User.count({ where: { role: ROLES.TEACHER } });
      const totalExams = await Exam.count();
      const totalRooms = await ExamRoom.count();
      const totalResults = await Result.count();

      // Active rooms
      const activeRooms = await ExamRoom.count({
        where: { status: 'active' }
      });

      // Recent activities
      const recentResults = await Result.findAll({
        limit: 5,
        include: [
          {
            model: User,
            as: 'student',
            attributes: ['fullName', 'email']
          },
          {
            model: ExamRoom,
            as: 'room',
            include: [{ model: Exam, as: 'exam', attributes: ['title'] }]
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.status(HTTP_STATUS.OK).json(
        HelperUtils.successResponse('Thành công', {
          stats: {
            totalUsers,
            totalStudents,
            totalTeachers,
            totalExams,
            totalRooms,
            totalResults,
            activeRooms
          },
          recentResults
        })
      );
    } catch (error) {
      Logger.error('Get stats error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        HelperUtils.errorResponse(MESSAGES.ERROR)
      );
    }
  }

  /**
   * Lấy danh sách users
   * GET /api/admin/users
   */
  static async getUsers(req, res) {
    try {
      const { page = 1, limit = 10, role, search } = req.query;
      const { offset, limit: pageLimit } = HelperUtils.getPagination(page, limit);

      const whereClause = {};

      // Lọc theo role
      if (role && Object.values(ROLES).includes(role)) {
        whereClause.role = role;
      }

      // Tìm kiếm theo tên hoặc email
      if (search) {
        whereClause[Op.or] = [
          { fullName: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ];
      }

      const { count, rows } = await User.findAndCountAll({
        where: whereClause,
        attributes: { exclude: ['password'] },
        offset,
        limit: pageLimit,
        order: [['createdAt', 'DESC']]
      });

      res.status(HTTP_STATUS.OK).json(
        HelperUtils.successResponse('Thành công', {
          users: rows,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: pageLimit,
            totalPages: Math.ceil(count / pageLimit)
          }
        })
      );
    } catch (error) {
      Logger.error('Get users error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        HelperUtils.errorResponse(MESSAGES.ERROR)
      );
    }
  }

  /**
   * Lấy chi tiết user
   * GET /api/admin/users/:id
   */
  static async getUserById(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id, {
        attributes: { exclude: ['password'] },
        include: [
          {
            model: Exam,
            as: 'exams',
            attributes: ['id', 'title', 'createdAt']
          },
          {
            model: Result,
            as: 'results',
            attributes: ['id', 'score', 'createdAt']
          }
        ]
      });

      if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          HelperUtils.errorResponse(MESSAGES.USER_NOT_FOUND)
        );
      }

      res.status(HTTP_STATUS.OK).json(
        HelperUtils.successResponse('Thành công', user)
      );
    } catch (error) {
      Logger.error('Get user by id error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        HelperUtils.errorResponse(MESSAGES.ERROR)
      );
    }
  }

  /**
   * Cập nhật user
   * PUT /api/admin/users/:id
   */
  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { fullName, email, role, isActive } = req.body;

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          HelperUtils.errorResponse(MESSAGES.USER_NOT_FOUND)
        );
      }

      // Không cho phép thay đổi role của chính mình
      if (parseInt(id) === req.user.id && role && role !== user.role) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          HelperUtils.errorResponse('Không thể thay đổi role của chính mình')
        );
      }

      // Cập nhật
      await user.update({
        fullName: fullName || user.fullName,
        email: email || user.email,
        role: role || user.role,
        isActive: isActive !== undefined ? isActive : user.isActive
      });

      Logger.info(`User ${id} updated by admin ${req.user.id}`);

      res.status(HTTP_STATUS.OK).json(
        HelperUtils.successResponse('Cập nhật user thành công')
      );
    } catch (error) {
      Logger.error('Update user error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        HelperUtils.errorResponse(MESSAGES.ERROR)
      );
    }
  }

  /**
   * Xóa user
   * DELETE /api/admin/users/:id
   */
  static async deleteUser(req, res) {
    try {
      const { id } = req.params;

      // Không cho phép xóa chính mình
      if (parseInt(id) === req.user.id) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          HelperUtils.errorResponse('Không thể xóa chính mình')
        );
      }

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          HelperUtils.errorResponse(MESSAGES.USER_NOT_FOUND)
        );
      }

      await user.destroy();

      Logger.info(`User ${id} deleted by admin ${req.user.id}`);

      res.status(HTTP_STATUS.OK).json(
        HelperUtils.successResponse('Xóa user thành công')
      );
    } catch (error) {
      Logger.error('Delete user error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        HelperUtils.errorResponse(MESSAGES.ERROR)
      );
    }
  }

  /**
   * Tạo user mới (admin tạo cho teacher hoặc student)
   * POST /api/admin/users
   */
  static async createUser(req, res) {
    try {
      const { fullName, email, password, role } = req.body;

      // Kiểm tra email đã tồn tại
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(HTTP_STATUS.CONFLICT).json(
          HelperUtils.errorResponse(MESSAGES.EMAIL_EXISTS)
        );
      }

      // Hash password
      const hashedPassword = await HelperUtils.hashPassword(password);

      // Tạo user
      const user = await User.create({
        fullName,
        email,
        password: hashedPassword,
        role: role || ROLES.STUDENT
      });

      Logger.info(`User created by admin: ${email}`);

      res.status(HTTP_STATUS.CREATED).json(
        HelperUtils.successResponse('Tạo user thành công', {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role
        })
      );
    } catch (error) {
      Logger.error('Create user error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        HelperUtils.errorResponse(MESSAGES.ERROR)
      );
    }
  }

  /**
   * Toggle active status
   * PATCH /api/admin/users/:id/toggle-active
   */
  static async toggleUserActive(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          HelperUtils.errorResponse(MESSAGES.USER_NOT_FOUND)
        );
      }

      await user.update({ isActive: !user.isActive });

      Logger.info(`User ${id} active status toggled to ${user.isActive}`);

      res.status(HTTP_STATUS.OK).json(
        HelperUtils.successResponse(
          `User ${user.isActive ? 'kích hoạt' : 'khóa'} thành công`
        )
      );
    } catch (error) {
      Logger.error('Toggle user active error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        HelperUtils.errorResponse(MESSAGES.ERROR)
      );
    }
  }
}

module.exports = AdminController;

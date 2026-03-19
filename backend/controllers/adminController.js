// =====================================================
// ADMIN CONTROLLER CLASS - QUẢN TRỊ HỆ THỐNG (OOP)
// =====================================================

const { User, Exam, Question, ExamRoom, Result } = require('../models');
const { HTTP_STATUS, MESSAGES, ROLES } = require('../utils/constants');
const HelperUtils = require('../utils/helpers');
const Logger = require('../utils/logger');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

class AdminController {
  /**
   * Lấy dashboard statistics
   * GET /api/admin/stats
   */
  static async getStats(req, res) {
    try {
      console.log(`Fetching admin stats for user: ${req.user.email} (Role: ${req.user.role})`);
      const totalStudents = await User.count({ where: { role: 'student' } });
      const totalTeachers = await User.count({ where: { role: 'teacher' } });
      const totalExams = await Exam.count();
      const totalRooms = await ExamRoom.count();
      const totalResults = await Result.count();
      const activeRooms = await ExamRoom.count({ where: { status: 'active' } });

      console.log('Basic counts fetched:', { totalStudents, totalTeachers, totalExams });

      let dailyActivity = [];
      let dailyNewStudents = [];

      try {
        // Assuming 'sequelize' is available in the scope, e.g., imported from '../models' or passed
        // If sequelize is not imported, this will cause a ReferenceError.
        // For faithful reproduction, I'm keeping it as provided.
        const [activity] = await sequelize.query(`
          SELECT CAST(created_at AS DATE) as day, COUNT(*) as count 
          FROM results 
          WHERE created_at >= DATEADD(day, -7, GETDATE())
          GROUP BY CAST(created_at AS DATE)
        `);
        dailyActivity = activity;
      } catch (qErr) {
        console.error('Error fetching daily activity:', qErr.message);
      }

      try {
        const [newStudents] = await sequelize.query(`
          SELECT CAST(created_at AS DATE) as day, COUNT(*) as count 
          FROM users 
          WHERE role = 'student' AND created_at >= DATEADD(day, -7, GETDATE())
          GROUP BY CAST(created_at AS DATE)
        `);
        dailyNewStudents = newStudents;
      } catch (qErr) {
        console.error('Error fetching daily new students:', qErr.message);
      }

      const totalUsers = await User.count();
      const stats = {
        totalUsers,
        totalStudents,
        totalTeachers,
        totalExams,
        totalRooms,
        totalResults,
        activeRooms,
        dailyActivity,
        dailyNewStudents
      };

      const recentResults = await Result.findAll({
        limit: 5,
        order: [['createdAt', 'DESC']],
        include: [
          { model: User, as: 'student', attributes: ['fullName'] },
          { model: ExamRoom, as: 'room', include: [{ model: Exam, as: 'exam', attributes: ['title'] }] }
        ]
      });

      res.status(HTTP_STATUS.OK).json(
        HelperUtils.successResponse('Thành công', {
          stats,
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

  /**
   * Lấy tất cả đề thi (Admin)
   * GET /api/admin/exams
   */
  static async getExamsAdmin(req, res) {
    try {
      const exams = await Exam.findAll({
        include: [
          { model: User, as: 'teacher', attributes: ['fullName'] },
          { model: Question, as: 'questions', attributes: ['id'] }
        ],
        order: [['createdAt', 'DESC']]
      });

      // Transform to include questionsCount
      const result = exams.map(exam => ({
        ...exam.toJSON(),
        questionsCount: exam.questions ? exam.questions.length : 0
      }));

      res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse('Thành công', result));
    } catch (error) {
      Logger.error('Admin get exams error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(error.message));
    }
  }

  /**
   * Lấy tất cả phòng thi (Admin)
   * GET /api/admin/rooms
   */
  static async getRoomsAdmin(req, res) {
    try {
      const rooms = await ExamRoom.findAll({
        include: [
          { model: Exam, as: 'exam', attributes: ['title'] },
          { model: User, as: 'creator', attributes: ['fullName'] }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse('Thành công', rooms));
    } catch (error) {
      Logger.error('Admin get rooms error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(error.message));
    }
  }

  /**
   * Lấy tất cả kết quả (Admin)
   * GET /api/admin/results
   */
  static async getResultsAdmin(req, res) {
    try {
      const results = await Result.findAll({
        include: [
          { model: User, as: 'student', attributes: ['fullName'] },
          { model: ExamRoom, as: 'room', include: [{ model: Exam, as: 'exam', attributes: ['title'] }] }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse('Thành công', results));
    } catch (error) {
      Logger.error('Admin get results error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(error.message));
    }
  }
}

module.exports = AdminController;

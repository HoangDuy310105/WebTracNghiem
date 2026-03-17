// =====================================================
// ADMIN SERVICE - Business Logic quản trị hệ thống
// =====================================================

const UserRepository = require('../Repository/UserRepository');
const ExamRepository = require('../Repository/ExamRepository');
const ExamRoomRepository = require('../Repository/ExamRoomRepository');
const ResultRepository = require('../Repository/ResultRepository');
const HelperUtils = require('../utils/helpers');
const Logger = require('../utils/logger');
const { ROLES } = require('../utils/constants');

class AdminService {
  static async getStats() {
    const totalUsers = await UserRepository.count();
    const totalStudents = await UserRepository.count({ role: ROLES.STUDENT });
    const totalTeachers = await UserRepository.count({ role: ROLES.TEACHER });
    const totalExams = await ExamRepository.count();
    const totalRooms = await ExamRoomRepository.count();
    const totalResults = await ResultRepository.count();
    const activeRooms = await ExamRoomRepository.count({ status: 'active' });
    const recentResults = await ResultRepository.getRecent(5);

    return {
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
    };
  }

  static async getUsers({ page = 1, limit = 10, role, search }) {
    const { count, rows } = await UserRepository.getList({ page, limit, role, search });
    return {
      users: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    };
  }

  static async getUserById(id) {
    const user = await UserRepository.findByIdWithDetails(id);
    if (!user) {
      throw { type: 'NOT_FOUND', message: 'Người dùng không tồn tại' };
    }
    return user;
  }

  static async createUser({ fullName, email, password, role }, adminId) {
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      throw { type: 'CONFLICT', message: 'Email đã được sử dụng' };
    }

    const hashedPassword = await HelperUtils.hashPassword(password);
    const user = await UserRepository.create({
      fullName,
      email,
      password: hashedPassword,
      role: role || ROLES.STUDENT
    });

    Logger.info(`User created by admin ${adminId}: ${email}`);
    return { id: user.id, fullName: user.fullName, email: user.email, role: user.role };
  }

  static async updateUser(id, { fullName, email, role, isActive }, adminUserId) {
    const user = await UserRepository.findById(id);
    if (!user) {
      throw { type: 'NOT_FOUND', message: 'Người dùng không tồn tại' };
    }
    if (parseInt(id) === adminUserId && role && role !== user.role) {
      throw { type: 'BAD_REQUEST', message: 'Không thể thay đổi role của chính mình' };
    }

    await UserRepository.update(user, {
      fullName: fullName || user.fullName,
      email: email || user.email,
      role: role || user.role,
      isActive: isActive !== undefined ? isActive : user.isActive
    });

    Logger.info(`User ${id} updated by admin ${adminUserId}`);
  }

  static async deleteUser(id, adminUserId) {
    if (parseInt(id) === adminUserId) {
      throw { type: 'BAD_REQUEST', message: 'Không thể xóa chính mình' };
    }

    const user = await UserRepository.findById(id);
    if (!user) {
      throw { type: 'NOT_FOUND', message: 'Người dùng không tồn tại' };
    }

    await UserRepository.delete(user);
    Logger.info(`User ${id} deleted by admin ${adminUserId}`);
  }

  static async getAdminExams({ page = 1, limit = 10, search = '' }) {
    const { count, rows } = await ExamRepository.getList({ page, limit, search, teacherId: null });
    return {
      exams: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    };
  }

  static async deleteAdminExam(id, adminId) {
    const exam = await ExamRepository.findById(id);
    if (!exam) {
      throw { type: 'NOT_FOUND', message: 'Đề thi không tồn tại' };
    }
    await ExamRepository.delete(exam);
    Logger.info(`Exam ${id} deleted by admin ${adminId}`);
  }

  static async getAdminRooms({ page = 1, limit = 20 }) {
    const { count, rows } = await ExamRoomRepository.getAdminList({ page, limit });
    return {
      rooms: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    };
  }

  static async getAdminResults({ page = 1, limit = 20 }) {
    const { Result, User, ExamRoom, Exam } = require('../models');
    const HelperUtils = require('../utils/helpers');
    const { offset, limit: pageLimit } = HelperUtils.getPagination(page, limit);

    const { count, rows } = await Result.findAndCountAll({
      include: [
        { model: User, as: 'student', attributes: ['id', 'fullName', 'email'] },
        {
          model: ExamRoom,
          as: 'room',
          attributes: ['id', 'roomCode'],
          include: [{ model: Exam, as: 'exam', attributes: ['id', 'title'] }]
        }
      ],
      offset,
      limit: pageLimit,
      order: [['createdAt', 'DESC']]
    });

    return {
      results: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: pageLimit,
        totalPages: Math.ceil(count / pageLimit)
      }
    };
  }

  static async toggleUserActive(id) {
    const user = await UserRepository.findById(id);
    if (!user) {
      throw { type: 'NOT_FOUND', message: 'Người dùng không tồn tại' };
    }

    await UserRepository.update(user, { isActive: !user.isActive });
    await user.reload();
    Logger.info(`User ${id} active status toggled to ${user.isActive}`);
    return user.isActive;
  }
}

module.exports = AdminService;

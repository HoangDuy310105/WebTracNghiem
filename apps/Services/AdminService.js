var DatabaseConnection = require(global.__basedir + '/apps/Database/DatabaseConnection');
var UserRepository = require(global.__basedir + '/apps/Repository/UserRepository');
var ExamRepository = require(global.__basedir + '/apps/Repository/ExamRepository');
var ExamRoomRepository = require(global.__basedir + '/apps/Repository/ExamRoomRepository');
var ResultRepository = require(global.__basedir + '/apps/Repository/ResultRepository');
var HelperUtils = require(global.__basedir + '/apps/utils/helpers');
var Logger = require(global.__basedir + '/apps/utils/logger');
var { ROLES } = require(global.__basedir + '/apps/utils/constants');

class AdminService {
    sequelize;
    transaction;
    userRepository;
    examRepository;
    examRoomRepository;
    resultRepository;

    constructor() {
        this.sequelize = DatabaseConnection.getSequelize();
        this.transaction = null;
        this.userRepository = new UserRepository(this.sequelize);
        this.examRepository = new ExamRepository(this.sequelize);
        this.examRoomRepository = new ExamRoomRepository(this.sequelize);
        this.resultRepository = new ResultRepository(this.sequelize);
    }

    async _startTransaction() {
        this.transaction = await this.sequelize.transaction();
        this.userRepository = new UserRepository(this.sequelize, this.transaction);
        this.examRepository = new ExamRepository(this.sequelize, this.transaction);
        this.examRoomRepository = new ExamRoomRepository(this.sequelize, this.transaction);
        this.resultRepository = new ResultRepository(this.sequelize, this.transaction);
    }

    async _safeRollback() {
        if (this.transaction && !this.transaction.finished) {
            await this.transaction.rollback();
        }
    }

  async getStats() {
    var totalUsers = await this.userRepository.count();
    var totalStudents = await this.userRepository.count({ role: ROLES.STUDENT });
    var totalTeachers = await this.userRepository.count({ role: ROLES.TEACHER });
    var totalExams = await this.examRepository.count();
    var totalRooms = await this.examRoomRepository.count();
    var totalResults = await this.resultRepository.count();
    var activeRooms = await this.examRoomRepository.count({ status: 'active' });
    var recentResults = await this.resultRepository.getRecent(5);

    return {
      stats: { totalUsers, totalStudents, totalTeachers, totalExams, totalRooms, totalResults, activeRooms },
      recentResults
    };
  }

  async getUsers({ page = 1, limit = 10, role, search }) {
    var { count, rows } = await this.userRepository.getList({ page, limit, role, search });
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

  async getUserById(id) {
    try {
      var user = await this.userRepository.findByIdWithDetails(id);
      if (!user) return { status: false, type: 'NOT_FOUND', message: 'Người dùng không tồn tại' };
      return { status: true, data: user };
    } catch (error) {
      return { status: false, type: 'SERVER_ERROR', message: error.message };
    }
  }

  async createUser({ fullName, email, password, role }, adminId) {
    await this._startTransaction();
    try {
      var existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        await this._safeRollback();
        return { status: false, type: 'CONFLICT', message: 'Email đã được sử dụng' };
      }

      var hashedPassword = await HelperUtils.hashPassword(password);
      var user = await this.userRepository.create({
        fullName, email,
        password: hashedPassword,
        role: role || ROLES.STUDENT
      });

      await this.transaction.commit();
      Logger.info('User created by admin ' + adminId + ': ' + email);
      return { status: true, id: user.id, fullName: user.fullName, email: user.email, role: user.role };
    } catch (error) {
      await this._safeRollback();
      return { status: false, type: 'SERVER_ERROR', message: error.message };
    }
  }

  async updateUser(id, { fullName, email, role, isActive }, adminUserId) {
    await this._startTransaction();
    try {
      var user = await this.userRepository.findById(id);
      if (!user) {
        await this._safeRollback();
        return { status: false, type: 'NOT_FOUND', message: 'Người dùng không tồn tại' };
      }
      if (parseInt(id) === adminUserId && role && role !== user.role) {
        await this._safeRollback();
        return { status: false, type: 'BAD_REQUEST', message: 'Không thể thay đổi role của chính mình' };
      }

      await this.userRepository.update(user, {
        fullName: fullName || user.fullName,
        email: email || user.email,
        role: role || user.role,
        isActive: isActive !== undefined ? isActive : user.isActive
      });

      await this.transaction.commit();
      Logger.info('User ' + id + ' updated by admin ' + adminUserId);
      return { status: true };
    } catch (error) {
      await this._safeRollback();
      return { status: false, type: 'SERVER_ERROR', message: error.message };
    }
  }

  async deleteUser(id, adminUserId) {
    await this._startTransaction();
    try {
      if (parseInt(id) === adminUserId) {
        await this._safeRollback();
        return { status: false, type: 'BAD_REQUEST', message: 'Không thể xóa chính mình' };
      }

      var user = await this.userRepository.findById(id);
      if (!user) {
        await this._safeRollback();
        return { status: false, type: 'NOT_FOUND', message: 'Người dùng không tồn tại' };
      }

      await this.userRepository.delete(user);
      await this.transaction.commit();
      Logger.info('User ' + id + ' deleted by admin ' + adminUserId);
      return { status: true };
    } catch (error) {
      await this._safeRollback();
      return { status: false, type: 'SERVER_ERROR', message: error.message };
    }
  }

  async getAdminExams({ page = 1, limit = 10, search = '' }) {
    var { count, rows } = await this.examRepository.getList({ page, limit, search, teacherId: null });
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

  async deleteAdminExam(id, adminId) {
    await this._startTransaction();
    try {
      var exam = await this.examRepository.findById(id);
      if (!exam) {
        await this._safeRollback();
        return { status: false, type: 'NOT_FOUND', message: 'Đề thi không tồn tại' };
      }
      await this.examRepository.delete(exam);
      await this.transaction.commit();
      Logger.info('Exam ' + id + ' deleted by admin ' + adminId);
      return { status: true };
    } catch (error) {
      await this._safeRollback();
      return { status: false, type: 'SERVER_ERROR', message: error.message };
    }
  }

  async getAdminRooms({ page = 1, limit = 20 }) {
    var { count, rows } = await this.examRoomRepository.getAdminList({ page, limit });
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

  async getAdminResults({ page = 1, limit = 20 }) {
    var rows = await this.resultRepository.getAdminList({ page, limit });
    return {
      results: rows.rows,
      pagination: {
        total: rows.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(rows.count / parseInt(limit))
      }
    };
  }

  async toggleUserActive(id) {
    await this._startTransaction();
    try {
      var user = await this.userRepository.findById(id);
      if (!user) {
        await this._safeRollback();
        return { status: false, type: 'NOT_FOUND', message: 'Người dùng không tồn tại' };
      }

      await this.userRepository.update(user, { isActive: !user.isActive });
      await this.transaction.commit();
      await user.reload();
      Logger.info('User ' + id + ' active status toggled to ' + user.isActive);
      return { status: true, isActive: user.isActive };
    } catch (error) {
      await this._safeRollback();
      return { status: false, type: 'SERVER_ERROR', message: error.message };
    }
  }
}

module.exports = AdminService;

// =====================================================
// AUTH SERVICE - Business Logic xác thực người dùng
// =====================================================

const jwt = require('jsonwebtoken');
const UserRepository = require('../Repository/UserRepository');
const HelperUtils = require('../utils/helpers');
const Logger = require('../utils/logger');
const { ROLES } = require('../utils/constants');

class AuthService {
  static async register({ fullName, email, password, role }) {
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

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    Logger.info(`User registered: ${email}`);
    return { id: user.id, fullName: user.fullName, email: user.email, role: user.role, token };
  }

  static async login({ email, password }) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw { type: 'UNAUTHORIZED', message: 'Email hoặc mật khẩu không đúng' };
    }

    const isPasswordValid = await HelperUtils.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw { type: 'UNAUTHORIZED', message: 'Email hoặc mật khẩu không đúng' };
    }

    if (!user.isActive) {
      throw { type: 'FORBIDDEN', message: 'Tài khoản đã bị khóa' };
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    Logger.info(`User logged in: ${email}`);
    return { id: user.id, fullName: user.fullName, email: user.email, role: user.role, token };
  }

  static async getMe(userId) {
    const user = await UserRepository.findById(userId, {
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      throw { type: 'NOT_FOUND', message: 'Người dùng không tồn tại' };
    }
    return user;
  }

  static async updateProfile(userId, { fullName, password }) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw { type: 'NOT_FOUND', message: 'Người dùng không tồn tại' };
    }

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (password) updateData.password = await HelperUtils.hashPassword(password);

    await UserRepository.update(user, updateData);

    // Reload để lấy giá trị mới nhất
    await user.reload();
    return { id: user.id, fullName: user.fullName, email: user.email, role: user.role };
  }
}

module.exports = AuthService;

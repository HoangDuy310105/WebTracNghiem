var jwt = require('jsonwebtoken');
var DatabaseConnection = require(global.__basedir + '/apps/Database/DatabaseConnection');
var UserRepository = require(global.__basedir + '/apps/Repository/UserRepository');
var HelperUtils = require(global.__basedir + '/apps/utils/helpers');
var Logger = require(global.__basedir + '/apps/utils/logger');
var { ROLES } = require(global.__basedir + '/apps/utils/constants');
var config = require(global.__basedir + '/Config/Setting.json');

class AuthService {
    sequelize;
    transaction;
    userRepository;

    constructor() {
        this.sequelize = DatabaseConnection.getSequelize();
        this.transaction = null;
        this.userRepository = new UserRepository(this.sequelize);
    }

    async _startTransaction() {
        this.transaction = await this.sequelize.transaction();
        this.userRepository = new UserRepository(this.sequelize, this.transaction);
    }

    async _safeRollback() {
        if (this.transaction && !this.transaction.finished) {
            await this.transaction.rollback();
        }
    }

    async register({ fullName, email, password, role }) {
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

            var token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                config.jwt.secret,
                { expiresIn: config.jwt.expire || '7d' }
            );

            Logger.info('User registered: ' + email);
            return { status: true, id: user.id, fullName: user.fullName, email: user.email, role: user.role, token };
        } catch (error) {
            await this._safeRollback();
            return { status: false, type: 'SERVER_ERROR', message: error.message };
        }
    }

    async login({ email, password }) {
        try {
            var user = await this.userRepository.findByEmail(email);
            if (!user) return { status: false, type: 'UNAUTHORIZED', message: 'Email hoặc mật khẩu không đúng' };

            var isPasswordValid = await HelperUtils.comparePassword(password, user.password);
            if (!isPasswordValid) return { status: false, type: 'UNAUTHORIZED', message: 'Email hoặc mật khẩu không đúng' };

            if (!user.isActive) return { status: false, type: 'FORBIDDEN', message: 'Tài khoản đã bị khóa' };

            var token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                config.jwt.secret,
                { expiresIn: config.jwt.expire || '7d' }
            );

            Logger.info('User logged in: ' + email);
            return { status: true, id: user.id, fullName: user.fullName, email: user.email, role: user.role, token };
        } catch (error) {
            return { status: false, type: 'SERVER_ERROR', message: error.message };
        }
    }

    async getMe(userId) {
        try {
            var user = await this.userRepository.findById(userId, {
                attributes: { exclude: ['password'] }
            });
            if (!user) return { status: false, type: 'NOT_FOUND', message: 'Người dùng không tồn tại' };
            return { status: true, data: user };
        } catch (error) {
            return { status: false, type: 'SERVER_ERROR', message: error.message };
        }
    }

    async updateProfile(userId, { fullName, password }) {
        await this._startTransaction();
        try {
            var user = await this.userRepository.findById(userId);
            if (!user) {
                await this._safeRollback();
                return { status: false, type: 'NOT_FOUND', message: 'Người dùng không tồn tại' };
            }

            var updateData = {};
            if (fullName) updateData.fullName = fullName;
            if (password) updateData.password = await HelperUtils.hashPassword(password);

            await this.userRepository.update(user, updateData);
            await this.transaction.commit();

            await user.reload();
            return { status: true, id: user.id, fullName: user.fullName, email: user.email, role: user.role };
        } catch (error) {
            await this._safeRollback();
            return { status: false, type: 'SERVER_ERROR', message: error.message };
        }
    }
}

module.exports = AuthService;

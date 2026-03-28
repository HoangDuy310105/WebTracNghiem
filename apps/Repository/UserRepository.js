var { UserModel: User, ExamModel: Exam, ResultModel: Result } = require(global.__basedir + '/apps/Database/Models');
var { Op } = require('sequelize');
var HelperUtils = require(global.__basedir + '/apps/utils/helpers');

class UserRepository {
    context;
    session;

    constructor(context, session = null) {
        this.context = context;
        this.session = session;
    }

    async findByEmail(email) {
        return User.findOne({ where: { email }, transaction: this.session });
    }

    async findById(id, options = {}) {
        return User.findByPk(id, { ...options, transaction: this.session });
    }

    async findByIdWithDetails(id) {
        return User.findByPk(id, {
            attributes: { exclude: ['password'] },
            include: [
                { model: Exam, as: 'exams', attributes: ['id', 'title', 'createdAt'] },
                { model: Result, as: 'results', attributes: ['id', 'score', 'createdAt'] }
            ],
            transaction: this.session
        });
    }

    async create(data) {
        return User.create(data, { transaction: this.session });
    }

    async update(instance, data) {
        return instance.update(data, { transaction: this.session });
    }

    async delete(instance) {
        return instance.destroy({ transaction: this.session });
    }

    async getList({ page = 1, limit = 10, role, search } = {}) {
        var { offset, limit: pageLimit } = HelperUtils.getPagination(page, limit);
        var whereClause = {};
        if (role) whereClause.role = role;
        if (search) whereClause[Op.or] = [
            { fullName: { [Op.like]: '%' + search + '%' } },
            { email: { [Op.like]: '%' + search + '%' } }
        ];
        return User.findAndCountAll({
            where: whereClause,
            attributes: { exclude: ['password'] },
            offset, limit: pageLimit,
            order: [['createdAt', 'DESC']],
            transaction: this.session
        });
    }

    async count(whereClause) {
        return User.count({ where: whereClause || {}, transaction: this.session });
    }
}

module.exports = UserRepository;

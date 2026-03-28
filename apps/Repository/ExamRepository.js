var { ExamModel: Exam, QuestionModel: Question, UserModel: User } = require(global.__basedir + '/apps/Database/Models');
var { Op } = require('sequelize');
var HelperUtils = require(global.__basedir + '/apps/utils/helpers');

class ExamRepository {
    context;
    session;

    constructor(context, session = null) {
        this.context = context;
        this.session = session;
    }

    async findById(id) {
        return Exam.findByPk(id, { transaction: this.session });
    }

    async findByIdWithDetails(id) {
        return Exam.findByPk(id, {
            include: [
                { model: User, as: 'teacher', attributes: ['id', 'fullName', 'email'] },
                { model: Question, as: 'questions', attributes: { exclude: ['correctAnswer'] } }
            ],
            transaction: this.session
        });
    }

    async getList({ page = 1, limit = 10, search = '', teacherId = null } = {}) {
        var { offset, limit: pageLimit } = HelperUtils.getPagination(page, limit);
        var whereClause = {};
        if (teacherId) whereClause.teacherId = teacherId;
        if (search) whereClause.title = { [Op.like]: '%' + search + '%' };
        return Exam.findAndCountAll({
            where: whereClause,
            include: [
                { model: User, as: 'teacher', attributes: ['id', 'fullName', 'email'] },
                { model: Question, as: 'questions', attributes: ['id'] }
            ],
            offset, limit: pageLimit,
            order: [['createdAt', 'DESC']],
            transaction: this.session
        });
    }

    async create(data) {
        return Exam.create(data, { transaction: this.session });
    }

    async update(instance, data) {
        return instance.update(data, { transaction: this.session });
    }

    async delete(instance) {
        return instance.destroy({ transaction: this.session });
    }

    async count() {
        return Exam.count({ transaction: this.session });
    }
}

module.exports = ExamRepository;

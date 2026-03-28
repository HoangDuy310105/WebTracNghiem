var { ExamRoomModel: ExamRoom, ExamModel: Exam, QuestionModel: Question, UserModel: User, ResultModel: Result } = require(global.__basedir + '/apps/Database/Models');
var HelperUtils = require(global.__basedir + '/apps/utils/helpers');

class ExamRoomRepository {
    context;
    session;

    constructor(context, session = null) {
        this.context = context;
        this.session = session;
    }

    async findById(id) {
        return ExamRoom.findByPk(id, { transaction: this.session });
    }

    async findByIdWithDetails(id) {
        return ExamRoom.findByPk(id, {
            include: [
                { model: Exam, as: 'exam', attributes: ['id', 'title', 'description', 'duration', 'totalQuestions'] },
                { model: User, as: 'creator', attributes: ['id', 'fullName', 'email'] },
                { model: Result, as: 'results', include: [{ model: User, as: 'student', attributes: ['id', 'fullName', 'email'] }] }
            ],
            transaction: this.session
        });
    }

    async findByIdWithExamAndQuestions(id) {
        return ExamRoom.findByPk(id, {
            include: [{ model: Exam, as: 'exam', include: [{ model: Question, as: 'questions' }] }],
            transaction: this.session
        });
    }

    async findByCode(roomCode) {
        return ExamRoom.findOne({
            where: { roomCode },
            include: [{ model: Exam, as: 'exam' }],
            transaction: this.session
        });
    }

    async findOneByCode(roomCode) {
        return ExamRoom.findOne({ where: { roomCode }, transaction: this.session });
    }

    async getList({ page = 1, limit = 10, createdBy = null, status = null } = {}) {
        var { offset, limit: pageLimit } = HelperUtils.getPagination(page, limit);
        var whereClause = {};
        if (createdBy) whereClause.createdBy = createdBy;
        if (status) whereClause.status = status;
        return ExamRoom.findAndCountAll({
            where: whereClause,
            include: [
                { model: Exam, as: 'exam', attributes: ['id', 'title', 'duration', 'totalQuestions'] },
                { model: User, as: 'creator', attributes: ['id', 'fullName', 'email'] }
            ],
            offset, limit: pageLimit,
            order: [['createdAt', 'DESC']],
            transaction: this.session
        });
    }

    async getAdminList({ page = 1, limit = 20 } = {}) {
        var { offset, limit: pageLimit } = HelperUtils.getPagination(page, limit);
        return ExamRoom.findAndCountAll({
            include: [
                { model: Exam, as: 'exam', attributes: ['id', 'title', 'duration'] },
                { model: User, as: 'creator', attributes: ['id', 'fullName', 'email'] }
            ],
            offset, limit: pageLimit,
            order: [['createdAt', 'DESC']],
            transaction: this.session
        });
    }

    async create(data) {
        return ExamRoom.create(data, { transaction: this.session });
    }

    async update(instance, data) {
        return instance.update(data, { transaction: this.session });
    }

    async updateById(id, data) {
        return ExamRoom.update(data, { where: { id }, transaction: this.session });
    }

    async delete(instance) {
        return instance.destroy({ transaction: this.session });
    }

    async count(whereClause) {
        return ExamRoom.count({ where: whereClause || {}, transaction: this.session });
    }
}

module.exports = ExamRoomRepository;

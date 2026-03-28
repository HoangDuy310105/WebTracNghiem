var { ResultModel: Result, ExamRoomModel: ExamRoom, ExamModel: Exam, UserModel: User } = require(global.__basedir + '/apps/Database/Models');
var HelperUtils = require(global.__basedir + '/apps/utils/helpers');

class ResultRepository {
    context;
    session;

    constructor(context, session = null) {
        this.context = context;
        this.session = session;
    }

    async findById(id) {
        return Result.findByPk(id, {
            include: [
                { model: User, as: 'student', attributes: ['id', 'fullName', 'email'] },
                { model: ExamRoom, as: 'room', include: [{ model: Exam, as: 'exam', attributes: ['id', 'title', 'duration', 'totalQuestions'] }] }
            ],
            transaction: this.session
        });
    }

    async findByStudentAndRoom(studentId, roomId) {
        return Result.findOne({ where: { studentId, roomId }, transaction: this.session });
    }

    async findByStudent(studentId) {
        return Result.findAll({
            where: { studentId },
            include: [{ model: ExamRoom, as: 'room', include: [{ model: Exam, as: 'exam', attributes: ['id', 'title', 'duration', 'totalQuestions'] }] }],
            order: [['submittedAt', 'DESC']],
            transaction: this.session
        });
    }

    async findByRoom(roomId, { page = 1, limit = 20 } = {}) {
        var { offset, limit: pageLimit } = HelperUtils.getPagination(page, limit);
        return Result.findAndCountAll({
            where: { roomId },
            include: [{ model: User, as: 'student', attributes: ['id', 'fullName', 'email'] }],
            offset, limit: pageLimit,
            order: [['score', 'DESC']],
            transaction: this.session
        });
    }

    async findByTeacher(teacherId) {
        return Result.findAll({
            include: [
                { model: User, as: 'student', attributes: ['id', 'fullName', 'email'] },
                { model: ExamRoom, as: 'room', where: { createdBy: teacherId }, include: [{ model: Exam, as: 'exam', attributes: ['id', 'title'] }] }
            ],
            order: [['createdAt', 'DESC']],
            transaction: this.session
        });
    }

    async getAdminList({ page = 1, limit = 20 } = {}) {
        var { offset, limit: pageLimit } = HelperUtils.getPagination(page, limit);
        return Result.findAndCountAll({
            include: [
                { model: User, as: 'student', attributes: ['id', 'fullName', 'email'] },
                { model: ExamRoom, as: 'room', attributes: ['id', 'roomCode'], include: [{ model: Exam, as: 'exam', attributes: ['id', 'title'] }] }
            ],
            offset, limit: pageLimit,
            order: [['createdAt', 'DESC']],
            transaction: this.session
        });
    }

    async create(data) {
        return Result.create(data, { transaction: this.session });
    }

    async delete(instance) {
        return instance.destroy({ transaction: this.session });
    }

    async count() {
        return Result.count({ transaction: this.session });
    }

    async getRecent(limit) {
        return Result.findAll({
            limit: limit || 5,
            include: [
                { model: User, as: 'student', attributes: ['fullName', 'email'] },
                { model: ExamRoom, as: 'room', include: [{ model: Exam, as: 'exam', attributes: ['title'] }] }
            ],
            order: [['createdAt', 'DESC']],
            transaction: this.session
        });
    }
}

module.exports = ResultRepository;

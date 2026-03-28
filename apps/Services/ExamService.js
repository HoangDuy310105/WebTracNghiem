var DatabaseConnection = require(global.__basedir + '/apps/Database/DatabaseConnection');
var ExamRepository = require(global.__basedir + '/apps/Repository/ExamRepository');
var QuestionRepository = require(global.__basedir + '/apps/Repository/QuestionRepository');
var Logger = require(global.__basedir + '/apps/utils/logger');

class ExamService {
    sequelize;
    transaction;
    examRepository;
    questionRepository;

    constructor() {
        this.sequelize = DatabaseConnection.getSequelize();
        this.transaction = null;
        this.examRepository = new ExamRepository(this.sequelize);
        this.questionRepository = new QuestionRepository(this.sequelize);
    }

    async _startTransaction() {
        this.transaction = await this.sequelize.transaction();
        this.examRepository = new ExamRepository(this.sequelize, this.transaction);
        this.questionRepository = new QuestionRepository(this.sequelize, this.transaction);
    }

    async _safeRollback() {
        if (this.transaction && !this.transaction.finished) {
            await this.transaction.rollback();
        }
    }

    async getExams({ page = 1, limit = 10, search = '', user }) {
        var teacherId = user.role === 'teacher' ? user.id : null;
        var { count, rows } = await this.examRepository.getList({ page, limit, search, teacherId });
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

    async getExamById(id) {
        try {
            var exam = await this.examRepository.findByIdWithDetails(id);
            if (!exam) return { status: false, type: 'NOT_FOUND', message: 'Đề thi không tồn tại' };
            return { status: true, data: exam };
        } catch (error) {
            return { status: false, type: 'SERVER_ERROR', message: error.message };
        }
    }

    async createExam({ title, description, duration, questions }, teacherId) {
        await this._startTransaction();
        try {
            var exam = await this.examRepository.create({
                title, description, duration,
                teacherId,
                totalQuestions: questions.length
            });

            var questionData = questions.map(function (q, index) {
                return {
                    examId: exam.id,
                    question: q.question,
                    optionA: q.optionA,
                    optionB: q.optionB,
                    optionC: q.optionC,
                    optionD: q.optionD,
                    correctAnswer: q.correctAnswer,
                    order: index + 1
                };
            });

            await this.questionRepository.bulkCreate(questionData);
            await this.transaction.commit();

            Logger.info('Exam created: ' + exam.id + ' by teacher ' + teacherId);
            return { status: true, examId: exam.id };
        } catch (error) {
            await this._safeRollback();
            return { status: false, type: 'SERVER_ERROR', message: error.message };
        }
    }

    async updateExam(id, { title, description, duration }, user) {
        await this._startTransaction();
        try {
            var exam = await this.examRepository.findById(id);
            if (!exam) {
                await this._safeRollback();
                return { status: false, type: 'NOT_FOUND', message: 'Đề thi không tồn tại' };
            }
            if (exam.teacherId !== user.id && user.role !== 'admin') {
                await this._safeRollback();
                return { status: false, type: 'FORBIDDEN', message: 'Không có quyền thực hiện' };
            }

            await this.examRepository.update(exam, { title, description, duration });
            await this.transaction.commit();
            Logger.info('Exam updated: ' + id);
            return { status: true };
        } catch (error) {
            await this._safeRollback();
            return { status: false, type: 'SERVER_ERROR', message: error.message };
        }
    }

    async deleteExam(id, user) {
        await this._startTransaction();
        try {
            var exam = await this.examRepository.findById(id);
            if (!exam) {
                await this._safeRollback();
                return { status: false, type: 'NOT_FOUND', message: 'Đề thi không tồn tại' };
            }
            if (exam.teacherId !== user.id && user.role !== 'admin') {
                await this._safeRollback();
                return { status: false, type: 'FORBIDDEN', message: 'Không có quyền thực hiện' };
            }

            await this.examRepository.delete(exam);
            await this.transaction.commit();
            Logger.info('Exam deleted: ' + id);
            return { status: true };
        } catch (error) {
            await this._safeRollback();
            return { status: false, type: 'SERVER_ERROR', message: error.message };
        }
    }
}

module.exports = ExamService;

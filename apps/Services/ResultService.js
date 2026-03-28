var DatabaseConnection = require(global.__basedir + '/apps/Database/DatabaseConnection');
var ResultRepository = require(global.__basedir + '/apps/Repository/ResultRepository');
var ExamRoomRepository = require(global.__basedir + '/apps/Repository/ExamRoomRepository');
var HelperUtils = require(global.__basedir + '/apps/utils/helpers');
var Logger = require(global.__basedir + '/apps/utils/logger');

class ResultService {
    sequelize;
    transaction;
    resultRepository;
    examRoomRepository;

    constructor() {
        this.sequelize = DatabaseConnection.getSequelize();
        this.transaction = null;
        this.resultRepository = new ResultRepository(this.sequelize);
        this.examRoomRepository = new ExamRoomRepository(this.sequelize);
    }

    async _startTransaction() {
        this.transaction = await this.sequelize.transaction();
        this.resultRepository = new ResultRepository(this.sequelize, this.transaction);
        this.examRoomRepository = new ExamRoomRepository(this.sequelize, this.transaction);
    }

    async _safeRollback() {
        if (this.transaction && !this.transaction.finished) {
            await this.transaction.rollback();
        }
    }

    async submitExam({ roomId, answers }, userId) {
        await this._startTransaction();
        try {
            var room = await this.examRoomRepository.findByIdWithExamAndQuestions(roomId);
            if (!room) {
                await this._safeRollback();
                return { status: false, type: 'NOT_FOUND', message: 'Phòng thi không tồn tại' };
            }

            var existingResult = await this.resultRepository.findByStudentAndRoom(userId, roomId);
            if (existingResult) {
                await this._safeRollback();
                return { status: false, type: 'BAD_REQUEST', message: 'Bạn đã nộp bài thi này rồi' };
            }

            var questions = room.exam.questions;
            var { correctAnswers, score, correctAnswerMap } = HelperUtils.calculateScore(answers, questions);

            var result = await this.resultRepository.create({
                studentId: userId,
                roomId, answers,
                correctAnswers, score,
                totalQuestions: questions.length
            });

            await this.transaction.commit();
            Logger.info('Exam submitted: student ' + userId + ', room ' + roomId + ', score ' + score);
            return {
                status: true,
                resultId: result.id,
                score: result.score,
                correctAnswers: result.correctAnswers,
                totalQuestions: result.totalQuestions,
                correctAnswerMap
            };
        } catch (error) {
            await this._safeRollback();
            return { status: false, type: 'SERVER_ERROR', message: error.message };
        }
    }

    async getMyResults(studentId) {
        try {
            var rows = await this.resultRepository.findByStudent(studentId);
            return { status: true, results: rows, pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 } };
        } catch (error) {
            return { status: false, type: 'SERVER_ERROR', message: error.message };
        }
    }

    async getResultById(id, user) {
        try {
            var result = await this.resultRepository.findById(id);
            if (!result) return { status: false, type: 'NOT_FOUND', message: 'Kết quả không tồn tại' };

            var isOwner = result.studentId === user.id;
            var isTeacher = user.role === 'teacher';
            var isAdmin = user.role === 'admin';
            if (!isOwner && !isTeacher && !isAdmin) {
                return { status: false, type: 'FORBIDDEN', message: 'Không có quyền thực hiện' };
            }
            return { status: true, data: result };
        } catch (error) {
            return { status: false, type: 'SERVER_ERROR', message: error.message };
        }
    }

    async getResultsByRoom(roomId, { page = 1, limit = 20 }, user) {
        try {
            var room = await this.examRoomRepository.findById(roomId);
            if (!room) return { status: false, type: 'NOT_FOUND', message: 'Phòng thi không tồn tại' };
            if (room.createdBy !== user.id && user.role !== 'admin') {
                return { status: false, type: 'FORBIDDEN', message: 'Không có quyền thực hiện' };
            }

            var { count, rows } = await this.resultRepository.findByRoom(roomId, { page, limit });
            return {
                status: true,
                results: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / parseInt(limit))
                }
            };
        } catch (error) {
            return { status: false, type: 'SERVER_ERROR', message: error.message };
        }
    }

    async getAllTeacherResults(teacherId) {
        try {
            var rows = await this.resultRepository.findByTeacher(teacherId);
            return { status: true, results: rows };
        } catch (error) {
            return { status: false, type: 'SERVER_ERROR', message: error.message };
        }
    }

    async deleteResult(id) {
        await this._startTransaction();
        try {
            var result = await this.resultRepository.findById(id);
            if (!result) {
                await this._safeRollback();
                return { status: false, type: 'NOT_FOUND', message: 'Kết quả không tồn tại' };
            }
            await this.resultRepository.delete(result);
            await this.transaction.commit();
            Logger.info('Result deleted: ' + id);
            return { status: true };
        } catch (error) {
            await this._safeRollback();
            return { status: false, type: 'SERVER_ERROR', message: error.message };
        }
    }
}

module.exports = ResultService;

var DatabaseConnection = require(global.__basedir + '/apps/Database/DatabaseConnection');
var ExamRoomRepository = require(global.__basedir + '/apps/Repository/ExamRoomRepository');
var ExamRepository = require(global.__basedir + '/apps/Repository/ExamRepository');
var ResultRepository = require(global.__basedir + '/apps/Repository/ResultRepository');
var HelperUtils = require(global.__basedir + '/apps/utils/helpers');
var Logger = require(global.__basedir + '/apps/utils/logger');
var { ROOM_STATUS } = require(global.__basedir + '/apps/utils/constants');

class RoomService {
    sequelize;
    transaction;
    examRoomRepository;
    examRepository;
    resultRepository;

    constructor() {
        this.sequelize = DatabaseConnection.getSequelize();
        this.transaction = null;
        this.examRoomRepository = new ExamRoomRepository(this.sequelize);
        this.examRepository = new ExamRepository(this.sequelize);
        this.resultRepository = new ResultRepository(this.sequelize);
    }

    async _startTransaction() {
        this.transaction = await this.sequelize.transaction();
        this.examRoomRepository = new ExamRoomRepository(this.sequelize, this.transaction);
        this.examRepository = new ExamRepository(this.sequelize, this.transaction);
        this.resultRepository = new ResultRepository(this.sequelize, this.transaction);
    }

    async _safeRollback() {
        if (this.transaction && !this.transaction.finished) {
            await this.transaction.rollback();
        }
    }

    async getRooms({ page = 1, limit = 10, status, user }) {
        var createdBy = user.role === 'teacher' ? user.id : null;
        var { count, rows } = await this.examRoomRepository.getList({ page, limit, status, createdBy });
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

    async getRoomById(id) {
        try {
            var room = await this.examRoomRepository.findByIdWithDetails(id);
            if (!room) return { status: false, type: 'NOT_FOUND', message: 'Phòng thi không tồn tại' };
            return { status: true, data: room };
        } catch (error) {
            return { status: false, type: 'SERVER_ERROR', message: error.message };
        }
    }

    async createRoom({ examId, startTime, endTime, maxParticipants }, userId) {
        await this._startTransaction();
        try {
            var exam = await this.examRepository.findById(examId);
            if (!exam) {
                await this._safeRollback();
                return { status: false, type: 'NOT_FOUND', message: 'Đề thi không tồn tại' };
            }

            var roomCode;
            var isUnique = false;
            while (!isUnique) {
                roomCode = HelperUtils.generateCode(6);
                var existing = await this.examRoomRepository.findOneByCode(roomCode);
                if (!existing) isUnique = true;
            }

            var room = await this.examRoomRepository.create({
                examId, roomCode, startTime, endTime,
                maxParticipants, createdBy: userId,
                status: ROOM_STATUS.PENDING
            });

            await this.transaction.commit();
            Logger.info('Room created: ' + room.id + ' with code ' + roomCode);
            return { status: true, roomId: room.id, roomCode: room.roomCode };
        } catch (error) {
            await this._safeRollback();
            return { status: false, type: 'SERVER_ERROR', message: error.message };
        }
    }

    async joinRoom(roomCode, userId) {
        await this._startTransaction();
        try {
            var room = await this.examRoomRepository.findByCode(roomCode);
            if (!room) {
                await this._safeRollback();
                return { status: false, type: 'NOT_FOUND', message: 'Phòng thi không tồn tại' };
            }

            var now = new Date();
            if (room.status === ROOM_STATUS.PENDING) {
                if (new Date(room.startTime) <= now && new Date(room.endTime) > now) {
                    await this.examRoomRepository.update(room, { status: ROOM_STATUS.ACTIVE });
                    room.status = ROOM_STATUS.ACTIVE;
                } else if (new Date(room.startTime) > now) {
                    await this._safeRollback();
                    return { status: false, type: 'BAD_REQUEST', message: 'Phòng thi chưa đến giờ mở' };
                } else {
                    await this._safeRollback();
                    return { status: false, type: 'BAD_REQUEST', message: 'Phòng thi đã hết giờ' };
                }
            } else if (room.status === ROOM_STATUS.COMPLETED || room.status === ROOM_STATUS.CANCELLED) {
                await this._safeRollback();
                return { status: false, type: 'BAD_REQUEST', message: 'Phòng thi đã kết thúc hoặc bị hủy' };
            }

            if (room.currentParticipants >= room.maxParticipants) {
                await this._safeRollback();
                return { status: false, type: 'BAD_REQUEST', message: 'Phòng thi đã đầy' };
            }

            var existingResult = await this.resultRepository.findByStudentAndRoom(userId, room.id);
            if (existingResult) {
                await this._safeRollback();
                return { status: false, type: 'BAD_REQUEST', message: 'Bạn đã tham gia phòng thi này' };
            }

            await this.examRoomRepository.updateById(room.id, {
                currentParticipants: (room.currentParticipants || 0) + 1
            });

            await this.transaction.commit();
            return { status: true, roomId: room.id, examId: room.examId, exam: room.exam };
        } catch (error) {
            await this._safeRollback();
            return { status: false, type: 'SERVER_ERROR', message: error.message };
        }
    }

    async updateRoomStatus(id, status, user) {
        await this._startTransaction();
        try {
            var room = await this.examRoomRepository.findById(id);
            if (!room) {
                await this._safeRollback();
                return { status: false, type: 'NOT_FOUND', message: 'Phòng thi không tồn tại' };
            }
            if (room.createdBy !== user.id && user.role !== 'admin') {
                await this._safeRollback();
                return { status: false, type: 'FORBIDDEN', message: 'Không có quyền thực hiện' };
            }

            await this.examRoomRepository.update(room, { status });
            await this.transaction.commit();
            Logger.info('Room ' + id + ' status updated to ' + status);
            return { status: true };
        } catch (error) {
            await this._safeRollback();
            return { status: false, type: 'SERVER_ERROR', message: error.message };
        }
    }

    async deleteRoom(id, user) {
        await this._startTransaction();
        try {
            var room = await this.examRoomRepository.findById(id);
            if (!room) {
                await this._safeRollback();
                return { status: false, type: 'NOT_FOUND', message: 'Phòng thi không tồn tại' };
            }
            if (room.createdBy !== user.id && user.role !== 'admin') {
                await this._safeRollback();
                return { status: false, type: 'FORBIDDEN', message: 'Không có quyền thực hiện' };
            }

            await this.examRoomRepository.delete(room);
            await this.transaction.commit();
            Logger.info('Room deleted: ' + id);
            return { status: true };
        } catch (error) {
            await this._safeRollback();
            return { status: false, type: 'SERVER_ERROR', message: error.message };
        }
    }
}

module.exports = RoomService;

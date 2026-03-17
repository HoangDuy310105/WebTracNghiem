// =====================================================
// ROOM SERVICE - Business Logic quản lý phòng thi
// =====================================================

const ExamRoomRepository = require('../Repository/ExamRoomRepository');
const ExamRepository = require('../Repository/ExamRepository');
const ResultRepository = require('../Repository/ResultRepository');
const HelperUtils = require('../utils/helpers');
const Logger = require('../utils/logger');
const { ROOM_STATUS } = require('../utils/constants');

class RoomService {
  static async getRooms({ page = 1, limit = 10, status, user }) {
    const createdBy = user.role === 'teacher' ? user.id : null;
    const { count, rows } = await ExamRoomRepository.getList({ page, limit, status, createdBy });

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

  static async getRoomById(id) {
    const room = await ExamRoomRepository.findByIdWithDetails(id);
    if (!room) {
      throw { type: 'NOT_FOUND', message: 'Phòng thi không tồn tại' };
    }
    return room;
  }

  static async createRoom({ examId, startTime, endTime, maxParticipants }, userId) {
    const exam = await ExamRepository.findById(examId);
    if (!exam) {
      throw { type: 'NOT_FOUND', message: 'Đề thi không tồn tại' };
    }

    // Tạo mã phòng unique
    let roomCode;
    let isUnique = false;
    while (!isUnique) {
      roomCode = HelperUtils.generateCode(6);
      const existing = await ExamRoomRepository.findOneByCode(roomCode);
      if (!existing) isUnique = true;
    }

    const room = await ExamRoomRepository.create({
      examId,
      roomCode,
      startTime,
      endTime,
      maxParticipants,
      createdBy: userId,
      status: ROOM_STATUS.PENDING
    });

    Logger.info(`Room created: ${room.id} with code ${roomCode}`);
    return { roomId: room.id, roomCode: room.roomCode };
  }

  static async joinRoom(roomCode, userId) {
    const room = await ExamRoomRepository.findByCode(roomCode);
    if (!room) {
      throw { type: 'NOT_FOUND', message: 'Phòng thi không tồn tại' };
    }

    const now = new Date();
    if (room.status === ROOM_STATUS.PENDING) {
      if (new Date(room.startTime) <= now && new Date(room.endTime) > now) {
        await ExamRoomRepository.update(room, { status: ROOM_STATUS.ACTIVE });
        room.status = ROOM_STATUS.ACTIVE;
      } else if (new Date(room.startTime) > now) {
        throw { type: 'BAD_REQUEST', message: 'Phòng thi chưa đến giờ mở' };
      } else {
        throw { type: 'BAD_REQUEST', message: 'Phòng thi đã hết giờ' };
      }
    } else if (room.status === ROOM_STATUS.COMPLETED || room.status === ROOM_STATUS.CANCELLED) {
      throw { type: 'BAD_REQUEST', message: 'Phòng thi đã kết thúc hoặc bị hủy' };
    }

    if (room.currentParticipants >= room.maxParticipants) {
      throw { type: 'BAD_REQUEST', message: 'Phòng thi đã đầy' };
    }

    const existingResult = await ResultRepository.findByStudentAndRoom(userId, room.id);
    if (existingResult) {
      throw { type: 'BAD_REQUEST', message: 'Bạn đã tham gia phòng thi này' };
    }

    await ExamRoomRepository.updateById(room.id, {
      currentParticipants: (room.currentParticipants || 0) + 1
    });

    return { roomId: room.id, examId: room.examId, exam: room.exam };
  }

  static async updateRoomStatus(id, status, user) {
    const room = await ExamRoomRepository.findById(id);
    if (!room) {
      throw { type: 'NOT_FOUND', message: 'Phòng thi không tồn tại' };
    }
    if (room.createdBy !== user.id && user.role !== 'admin') {
      throw { type: 'FORBIDDEN', message: 'Không có quyền thực hiện' };
    }

    await ExamRoomRepository.update(room, { status });
    Logger.info(`Room ${id} status updated to ${status}`);
  }

  static async deleteRoom(id, user) {
    const room = await ExamRoomRepository.findById(id);
    if (!room) {
      throw { type: 'NOT_FOUND', message: 'Phòng thi không tồn tại' };
    }
    if (room.createdBy !== user.id && user.role !== 'admin') {
      throw { type: 'FORBIDDEN', message: 'Không có quyền thực hiện' };
    }

    await ExamRoomRepository.delete(room);
    Logger.info(`Room deleted: ${id}`);
  }
}

module.exports = RoomService;

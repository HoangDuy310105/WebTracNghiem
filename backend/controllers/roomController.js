// =====================================================
// ROOM CONTROLLER CLASS - QUẢN LÝ PHÒNG THI (OOP)
// =====================================================

const { ExamRoom, Exam, User, Result } = require('../models');
const { HTTP_STATUS, MESSAGES, ROOM_STATUS } = require('../utils/constants');
const HelperUtils = require('../utils/helpers');
const Logger = require('../utils/logger');

class RoomController {
  /**
   * Lấy danh sách phòng thi
   * GET /api/rooms
   */
  static async getRooms(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const { offset, limit: pageLimit } = HelperUtils.getPagination(page, limit);

      const whereClause = {};

      // Nếu là teacher, chỉ lấy phòng của mình
      if (req.user.role === 'teacher') {
        whereClause.createdBy = req.user.id;
      }

      // Lọc theo status
      if (status && Object.values(ROOM_STATUS).includes(status)) {
        whereClause.status = status;
      }

      const { count, rows } = await ExamRoom.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Exam,
            as: 'exam',
            attributes: ['id', 'title', 'duration', 'totalQuestions']
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'fullName', 'email']
          }
        ],
        offset,
        limit: pageLimit,
        order: [['createdAt', 'DESC']]
      });

      res.status(HTTP_STATUS.OK).json(
        HelperUtils.successResponse('Thành công', {
          rooms: rows,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: pageLimit,
            totalPages: Math.ceil(count / pageLimit)
          }
        })
      );
    } catch (error) {
      Logger.error('Get rooms error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        HelperUtils.errorResponse(MESSAGES.ERROR)
      );
    }
  }

  /**
   * Lấy chi tiết phòng thi
   * GET /api/rooms/:id
   */
  static async getRoomById(req, res) {
    try {
      const { id } = req.params;

      const room = await ExamRoom.findByPk(id, {
        include: [
          {
            model: Exam,
            as: 'exam',
            attributes: ['id', 'title', 'description', 'duration', 'totalQuestions']
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'fullName', 'email']
          },
          {
            model: Result,
            as: 'results',
            include: [
              {
                model: User,
                as: 'student',
                attributes: ['id', 'fullName', 'email']
              }
            ]
          }
        ]
      });

      if (!room) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          HelperUtils.errorResponse(MESSAGES.ROOM_NOT_FOUND)
        );
      }

      res.status(HTTP_STATUS.OK).json(
        HelperUtils.successResponse('Thành công', room)
      );
    } catch (error) {
      Logger.error('Get room by id error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        HelperUtils.errorResponse(MESSAGES.ERROR)
      );
    }
  }

  /**
   * Tạo phòng thi mới
   * POST /api/rooms
   */
  static async createRoom(req, res) {
    try {
      const { examId, startTime, endTime, maxParticipants } = req.body;

      // Kiểm tra exam có tồn tại
      const exam = await Exam.findByPk(examId);
      if (!exam) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          HelperUtils.errorResponse(MESSAGES.EXAM_NOT_FOUND)
        );
      }

      // Tạo mã phòng unique
      let roomCode;
      let isUnique = false;
      while (!isUnique) {
        roomCode = HelperUtils.generateCode(6);
        const existing = await ExamRoom.findOne({ where: { roomCode } });
        if (!existing) isUnique = true;
      }

      // Tạo phòng
      const room = await ExamRoom.create({
        examId,
        roomCode,
        startTime,
        endTime,
        maxParticipants,
        createdBy: req.user.id,
        status: ROOM_STATUS.PENDING
      });

      Logger.info(`Room created: ${room.id} with code ${roomCode}`);

      res.status(HTTP_STATUS.CREATED).json(
        HelperUtils.successResponse(MESSAGES.ROOM_CREATED, {
          roomId: room.id,
          roomCode: room.roomCode
        })
      );
    } catch (error) {
      Logger.error('Create room error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        HelperUtils.errorResponse(MESSAGES.ERROR)
      );
    }
  }

  /**
   * Tham gia phòng thi bằng mã code
   * POST /api/rooms/join
   */
  static async joinRoom(req, res) {
    try {
      const { roomCode } = req.body;

      const room = await ExamRoom.findOne({
        where: { roomCode },
        include: [{ model: Exam, as: 'exam' }]
      });

      if (!room) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          HelperUtils.errorResponse(MESSAGES.ROOM_NOT_FOUND)
        );
      }

      // Kiểm tra status phòng
      if (room.status !== ROOM_STATUS.ACTIVE) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          HelperUtils.errorResponse('Phòng thi chưa mở hoặc đã kết thúc')
        );
      }

      // Kiểm tra số lượng
      if (room.currentParticipants >= room.maxParticipants) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          HelperUtils.errorResponse('Phòng thi đã đầy')
        );
      }

      // Kiểm tra đã tham gia chưa
      const existingResult = await Result.findOne({
        where: {
          studentId: req.user.id,
          roomId: room.id
        }
      });

      if (existingResult) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          HelperUtils.errorResponse('Bạn đã tham gia phòng thi này')
        );
      }

      // Tăng số lượng participant
      await room.increment('currentParticipants');

      res.status(HTTP_STATUS.OK).json(
        HelperUtils.successResponse('Tham gia phòng thi thành công', {
          roomId: room.id,
          examId: room.examId,
          exam: room.exam
        })
      );
    } catch (error) {
      Logger.error('Join room error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        HelperUtils.errorResponse(MESSAGES.ERROR)
      );
    }
  }

  /**
   * Cập nhật trạng thái phòng
   * PATCH /api/rooms/:id/status
   */
  static async updateRoomStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const room = await ExamRoom.findByPk(id);

      if (!room) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          HelperUtils.errorResponse(MESSAGES.ROOM_NOT_FOUND)
        );
      }

      // Kiểm tra quyền
      if (room.createdBy !== req.user.id && req.user.role !== 'admin') {
        return res.status(HTTP_STATUS.FORBIDDEN).json(
          HelperUtils.errorResponse(MESSAGES.FORBIDDEN)
        );
      }

      await room.update({ status });

      Logger.info(`Room ${id} status updated to ${status}`);

      res.status(HTTP_STATUS.OK).json(
        HelperUtils.successResponse('Cập nhật trạng thái thành công')
      );
    } catch (error) {
      Logger.error('Update room status error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        HelperUtils.errorResponse(MESSAGES.ERROR)
      );
    }
  }

  /**
   * Xóa phòng thi
   * DELETE /api/rooms/:id
   */
  static async deleteRoom(req, res) {
    try {
      const { id } = req.params;

      const room = await ExamRoom.findByPk(id);

      if (!room) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(
          HelperUtils.errorResponse(MESSAGES.ROOM_NOT_FOUND)
        );
      }

      // Kiểm tra quyền
      if (room.createdBy !== req.user.id && req.user.role !== 'admin') {
        return res.status(HTTP_STATUS.FORBIDDEN).json(
          HelperUtils.errorResponse(MESSAGES.FORBIDDEN)
        );
      }

      await room.destroy();

      Logger.info(`Room deleted: ${id}`);

      res.status(HTTP_STATUS.OK).json(
        HelperUtils.successResponse(MESSAGES.ROOM_DELETED)
      );
    } catch (error) {
      Logger.error('Delete room error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        HelperUtils.errorResponse(MESSAGES.ERROR)
      );
    }
  }
}

module.exports = RoomController;

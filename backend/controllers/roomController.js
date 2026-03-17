// =====================================================
// ROOM CONTROLLER CLASS - HTTP handler (thin), gọi RoomService
// =====================================================

const { HTTP_STATUS, MESSAGES } = require('../utils/constants');
const HelperUtils = require('../utils/helpers');
const Logger = require('../utils/logger');
const RoomService = require('../Services/RoomService');

const TYPE_TO_STATUS = {
  CONFLICT: HTTP_STATUS.CONFLICT,
  UNAUTHORIZED: HTTP_STATUS.UNAUTHORIZED,
  FORBIDDEN: HTTP_STATUS.FORBIDDEN,
  NOT_FOUND: HTTP_STATUS.NOT_FOUND,
  BAD_REQUEST: HTTP_STATUS.BAD_REQUEST
};

class RoomController {
  /**
   * Lấy danh sách phòng thi
   * GET /api/rooms
   */
  static async getRooms(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const data = await RoomService.getRooms({ page, limit, status, user: req.user });
      res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse('Thành công', data));
    } catch (error) {
      if (error.type) {
        return res.status(TYPE_TO_STATUS[error.type] || HTTP_STATUS.BAD_REQUEST).json(
          HelperUtils.errorResponse(error.message)
        );
      }
      Logger.error('Get rooms error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
  }

  /**
   * Lấy chi tiết phòng thi
   * GET /api/rooms/:id
   */
  static async getRoomById(req, res) {
    try {
      const room = await RoomService.getRoomById(req.params.id);
      res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse('Thành công', room));
    } catch (error) {
      if (error.type) {
        return res.status(TYPE_TO_STATUS[error.type] || HTTP_STATUS.BAD_REQUEST).json(
          HelperUtils.errorResponse(error.message)
        );
      }
      Logger.error('Get room by id error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
  }

  /**
   * Tạo phòng thi mới
   * POST /api/rooms
   */
  static async createRoom(req, res) {
    try {
      const data = await RoomService.createRoom(req.body, req.user.id);
      res.status(HTTP_STATUS.CREATED).json(HelperUtils.successResponse(MESSAGES.ROOM_CREATED, data));
    } catch (error) {
      if (error.type) {
        return res.status(TYPE_TO_STATUS[error.type] || HTTP_STATUS.BAD_REQUEST).json(
          HelperUtils.errorResponse(error.message)
        );
      }
      Logger.error('Create room error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
  }

  /**
   * Tham gia phòng thi bằng mã code
   * POST /api/rooms/join
   */
  static async joinRoom(req, res) {
    try {
      const { roomCode } = req.body;
      const data = await RoomService.joinRoom(roomCode, req.user.id);
      res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse('Tham gia phòng thi thành công', data));
    } catch (error) {
      if (error.type) {
        return res.status(TYPE_TO_STATUS[error.type] || HTTP_STATUS.BAD_REQUEST).json(
          HelperUtils.errorResponse(error.message)
        );
      }
      Logger.error('Join room error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse('Lỗi: ' + error.message));
    }
  }

  /**
   * Cập nhật trạng thái phòng
   * PATCH /api/rooms/:id/status
   */
  static async updateRoomStatus(req, res) {
    try {
      await RoomService.updateRoomStatus(req.params.id, req.body.status, req.user);
      res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse('Cập nhật trạng thái thành công'));
    } catch (error) {
      if (error.type) {
        return res.status(TYPE_TO_STATUS[error.type] || HTTP_STATUS.BAD_REQUEST).json(
          HelperUtils.errorResponse(error.message)
        );
      }
      Logger.error('Update room status error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
  }

  /**
   * Xóa phòng thi
   * DELETE /api/rooms/:id
   */
  static async deleteRoom(req, res) {
    try {
      await RoomService.deleteRoom(req.params.id, req.user);
      res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse(MESSAGES.ROOM_DELETED));
    } catch (error) {
      if (error.type) {
        return res.status(TYPE_TO_STATUS[error.type] || HTTP_STATUS.BAD_REQUEST).json(
          HelperUtils.errorResponse(error.message)
        );
      }
      Logger.error('Delete room error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
  }
}

module.exports = RoomController;

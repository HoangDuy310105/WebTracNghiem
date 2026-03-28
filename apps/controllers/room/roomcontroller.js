var express = require("express");
var router = express.Router();
var RoomService = require(global.__basedir + "/apps/Services/RoomService");
var AuthMiddleware = require(global.__basedir + "/apps/middlewares/auth");
var ValidationMiddleware = require(global.__basedir + "/apps/middlewares/validate");
var { createRoomValidator, joinRoomValidator } = require(global.__basedir + "/apps/validators/roomValidator");
var HelperUtils = require(global.__basedir + "/apps/utils/helpers");
var Logger = require(global.__basedir + "/apps/utils/logger");
var { HTTP_STATUS, MESSAGES, ROLES } = require(global.__basedir + "/apps/utils/constants");

var TYPE_TO_STATUS = {
    CONFLICT: HTTP_STATUS.CONFLICT,
    UNAUTHORIZED: HTTP_STATUS.UNAUTHORIZED,
    FORBIDDEN: HTTP_STATUS.FORBIDDEN,
    NOT_FOUND: HTTP_STATUS.NOT_FOUND,
    BAD_REQUEST: HTTP_STATUS.BAD_REQUEST
};

router.use(AuthMiddleware.authenticate);

// GET /api/rooms
router.get("/", async function (req, res) {
    try {
        var roomService = new RoomService();
        var { page = 1, limit = 10, status } = req.query;
        var data = await roomService.getRooms({ page, limit, status, user: req.user });
        res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse('Thành công', data));
    } catch (error) {
        Logger.error('Get rooms error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
});

// GET /api/rooms/:id
router.get("/:id", async function (req, res) {
    try {
        var roomService = new RoomService();
        var result = await roomService.getRoomById(req.params.id);
        if (!result.status) return res.status(TYPE_TO_STATUS[result.type] || HTTP_STATUS.BAD_REQUEST).json(HelperUtils.errorResponse(result.message));
        res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse('Thành công', result.data));
    } catch (error) {
        Logger.error('Get room by id error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
});

// POST /api/rooms
router.post("/", AuthMiddleware.authorize(ROLES.TEACHER, ROLES.ADMIN), createRoomValidator, ValidationMiddleware.validate, async function (req, res) {
    try {
        var roomService = new RoomService();
        var data = await roomService.createRoom(req.body, req.user.id);
        if (!data.status) return res.status(TYPE_TO_STATUS[data.type] || HTTP_STATUS.BAD_REQUEST).json(HelperUtils.errorResponse(data.message));
        res.status(HTTP_STATUS.CREATED).json(HelperUtils.successResponse(MESSAGES.ROOM_CREATED, data));
    } catch (error) {
        Logger.error('Create room error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
});

// POST /api/rooms/join
router.post("/join", AuthMiddleware.authorize(ROLES.STUDENT), joinRoomValidator, ValidationMiddleware.validate, async function (req, res) {
    try {
        var roomService = new RoomService();
        var data = await roomService.joinRoom(req.body.roomCode, req.user.id);
        if (!data.status) return res.status(TYPE_TO_STATUS[data.type] || HTTP_STATUS.BAD_REQUEST).json(HelperUtils.errorResponse(data.message));
        res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse('Tham gia phòng thi thành công', data));
    } catch (error) {
        Logger.error('Join room error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse('Lỗi: ' + error.message));
    }
});

// PATCH /api/rooms/:id/status
router.patch("/:id/status", AuthMiddleware.authorize(ROLES.TEACHER, ROLES.ADMIN), async function (req, res) {
    try {
        var roomService = new RoomService();
        var result = await roomService.updateRoomStatus(req.params.id, req.body.status, req.user);
        if (!result.status) return res.status(TYPE_TO_STATUS[result.type] || HTTP_STATUS.BAD_REQUEST).json(HelperUtils.errorResponse(result.message));
        res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse('Cập nhật trạng thái thành công'));
    } catch (error) {
        Logger.error('Update room status error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
});

// DELETE /api/rooms/:id
router.delete("/:id", AuthMiddleware.authorize(ROLES.TEACHER, ROLES.ADMIN), async function (req, res) {
    try {
        var roomService = new RoomService();
        var result = await roomService.deleteRoom(req.params.id, req.user);
        if (!result.status) return res.status(TYPE_TO_STATUS[result.type] || HTTP_STATUS.BAD_REQUEST).json(HelperUtils.errorResponse(result.message));
        res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse(MESSAGES.ROOM_DELETED));
    } catch (error) {
        Logger.error('Delete room error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
});

module.exports = router;

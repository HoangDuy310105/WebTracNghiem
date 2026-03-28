var express = require("express");
var router = express.Router();
var ResultService = require(global.__basedir + "/apps/Services/ResultService");
var AuthMiddleware = require(global.__basedir + "/apps/middlewares/auth");
var ValidationMiddleware = require(global.__basedir + "/apps/middlewares/validate");
var { submitExamValidator, resultIdValidator } = require(global.__basedir + "/apps/validators/resultValidator");
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

// POST /api/results/submit
router.post("/submit", AuthMiddleware.authorize(ROLES.STUDENT), submitExamValidator, ValidationMiddleware.validate, async function (req, res) {
    try {
        var resultService = new ResultService();
        var data = await resultService.submitExam(req.body, req.user.id);
        if (!data.status) return res.status(TYPE_TO_STATUS[data.type] || HTTP_STATUS.BAD_REQUEST).json(HelperUtils.errorResponse(data.message));
        res.status(HTTP_STATUS.CREATED).json(HelperUtils.successResponse('Nộp bài thành công', data));
    } catch (error) {
        Logger.error('Submit exam error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
});

// GET /api/results/my-results
router.get("/my-results", AuthMiddleware.authorize(ROLES.STUDENT), async function (req, res) {
    try {
        var resultService = new ResultService();
        var data = await resultService.getMyResults(req.user.id);
        if (!data.status) return res.status(TYPE_TO_STATUS[data.type] || HTTP_STATUS.BAD_REQUEST).json(HelperUtils.errorResponse(data.message));
        res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse('Thành công', data));
    } catch (error) {
        Logger.error('Get my results error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse('Lỗi: ' + error.message));
    }
});

// GET /api/results/teacher/all
router.get("/teacher/all", AuthMiddleware.authorize(ROLES.TEACHER, ROLES.ADMIN), async function (req, res) {
    try {
        var resultService = new ResultService();
        var data = await resultService.getAllTeacherResults(req.user.id);
        if (!data.status) return res.status(TYPE_TO_STATUS[data.type] || HTTP_STATUS.BAD_REQUEST).json(HelperUtils.errorResponse(data.message));
        res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse('Thành công', data));
    } catch (error) {
        Logger.error('Get all teacher results error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
});

// GET /api/results/room/:roomId
router.get("/room/:roomId", AuthMiddleware.authorize(ROLES.TEACHER, ROLES.ADMIN), async function (req, res) {
    try {
        var resultService = new ResultService();
        var { page = 1, limit = 20 } = req.query;
        var data = await resultService.getResultsByRoom(req.params.roomId, { page, limit }, req.user);
        if (!data.status) return res.status(TYPE_TO_STATUS[data.type] || HTTP_STATUS.BAD_REQUEST).json(HelperUtils.errorResponse(data.message));
        res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse('Thành công', data));
    } catch (error) {
        Logger.error('Get results by room error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
});

// GET /api/results/:id
router.get("/:id", resultIdValidator, ValidationMiddleware.validate, async function (req, res) {
    try {
        var resultService = new ResultService();
        var result = await resultService.getResultById(req.params.id, req.user);
        if (!result.status) return res.status(TYPE_TO_STATUS[result.type] || HTTP_STATUS.BAD_REQUEST).json(HelperUtils.errorResponse(result.message));
        res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse('Thành công', result.data));
    } catch (error) {
        Logger.error('Get result by id error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
});

// DELETE /api/results/:id
router.delete("/:id", AuthMiddleware.authorize(ROLES.ADMIN), resultIdValidator, ValidationMiddleware.validate, async function (req, res) {
    try {
        var resultService = new ResultService();
        var result = await resultService.deleteResult(req.params.id);
        if (!result.status) return res.status(TYPE_TO_STATUS[result.type] || HTTP_STATUS.BAD_REQUEST).json(HelperUtils.errorResponse(result.message));
        res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse(MESSAGES.RESULT_DELETED));
    } catch (error) {
        Logger.error('Delete result error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
});

module.exports = router;

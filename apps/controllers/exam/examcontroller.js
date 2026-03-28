var express = require("express");
var router = express.Router();
var ExamService = require(global.__basedir + "/apps/Services/ExamService");
var AuthMiddleware = require(global.__basedir + "/apps/middlewares/auth");
var ValidationMiddleware = require(global.__basedir + "/apps/middlewares/validate");
var { createExamValidator, examIdValidator } = require(global.__basedir + "/apps/validators/examValidator");
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

// GET /api/exams
router.get("/", async function (req, res) {
    try {
        var examService = new ExamService();
        var { page = 1, limit = 10, search = '' } = req.query;
        var data = await examService.getExams({ page, limit, search, user: req.user });
        res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse('Thành công', data));
    } catch (error) {
        Logger.error('Get exams error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
});

// GET /api/exams/:id
router.get("/:id", examIdValidator, ValidationMiddleware.validate, async function (req, res) {
    try {
        var examService = new ExamService();
        var result = await examService.getExamById(req.params.id);
        if (!result.status) return res.status(TYPE_TO_STATUS[result.type] || HTTP_STATUS.BAD_REQUEST).json(HelperUtils.errorResponse(result.message));
        res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse('Thành công', result.data));
    } catch (error) {
        Logger.error('Get exam by id error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
});

// POST /api/exams
router.post("/", AuthMiddleware.authorize(ROLES.TEACHER, ROLES.ADMIN), createExamValidator, ValidationMiddleware.validate, async function (req, res) {
    try {
        var examService = new ExamService();
        var data = await examService.createExam(req.body, req.user.id);
        if (!data.status) return res.status(TYPE_TO_STATUS[data.type] || HTTP_STATUS.BAD_REQUEST).json(HelperUtils.errorResponse(data.message));
        res.status(HTTP_STATUS.CREATED).json(HelperUtils.successResponse(MESSAGES.EXAM_CREATED, data));
    } catch (error) {
        Logger.error('Create exam error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(error.message || MESSAGES.ERROR));
    }
});

// PUT /api/exams/:id
router.put("/:id", AuthMiddleware.authorize(ROLES.TEACHER, ROLES.ADMIN), examIdValidator, ValidationMiddleware.validate, async function (req, res) {
    try {
        var examService = new ExamService();
        var result = await examService.updateExam(req.params.id, req.body, req.user);
        if (!result.status) return res.status(TYPE_TO_STATUS[result.type] || HTTP_STATUS.BAD_REQUEST).json(HelperUtils.errorResponse(result.message));
        res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse(MESSAGES.EXAM_UPDATED));
    } catch (error) {
        Logger.error('Update exam error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
});

// DELETE /api/exams/:id
router.delete("/:id", AuthMiddleware.authorize(ROLES.TEACHER, ROLES.ADMIN), examIdValidator, ValidationMiddleware.validate, async function (req, res) {
    try {
        var examService = new ExamService();
        var result = await examService.deleteExam(req.params.id, req.user);
        if (!result.status) return res.status(TYPE_TO_STATUS[result.type] || HTTP_STATUS.BAD_REQUEST).json(HelperUtils.errorResponse(result.message));
        res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse(MESSAGES.EXAM_DELETED));
    } catch (error) {
        Logger.error('Delete exam error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
});

module.exports = router;

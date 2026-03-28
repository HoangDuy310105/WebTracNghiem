var express = require("express");
var router = express.Router();
var AdminService = require(global.__basedir + "/apps/Services/AdminService");
var AuthMiddleware = require(global.__basedir + "/apps/middlewares/auth");
var ValidationMiddleware = require(global.__basedir + "/apps/middlewares/validate");
var { registerValidator } = require(global.__basedir + "/apps/validators/authValidator");
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
router.use(AuthMiddleware.authorize(ROLES.ADMIN));

// GET /api/admin/stats
router.get("/stats", async function (req, res) {
    try {
        var adminService = new AdminService();
        var data = await adminService.getStats();
        res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse('Thành công', data));
    } catch (error) {
        Logger.error('Get stats error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
});

// GET /api/admin/users
router.get("/users", async function (req, res) {
    try {
        var adminService = new AdminService();
        var data = await adminService.getUsers(req.query);
        res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse('Thành công', data));
    } catch (error) {
        Logger.error('Get users error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
});

// GET /api/admin/users/:id
router.get("/users/:id", async function (req, res) {
    try {
        var adminService = new AdminService();
        var result = await adminService.getUserById(req.params.id);
        if (!result.status) return res.status(TYPE_TO_STATUS[result.type] || HTTP_STATUS.BAD_REQUEST).json(HelperUtils.errorResponse(result.message));
        res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse('Thành công', result.data));
    } catch (error) {
        Logger.error('Get user by id error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
});

// POST /api/admin/users
router.post("/users", registerValidator, ValidationMiddleware.validate, async function (req, res) {
    try {
        var adminService = new AdminService();
        var data = await adminService.createUser(req.body, req.user.id);
        if (!data.status) return res.status(TYPE_TO_STATUS[data.type] || HTTP_STATUS.BAD_REQUEST).json(HelperUtils.errorResponse(data.message));
        res.status(HTTP_STATUS.CREATED).json(HelperUtils.successResponse('Tạo user thành công', data));
    } catch (error) {
        Logger.error('Create user error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
});

// PUT /api/admin/users/:id
router.put("/users/:id", async function (req, res) {
    try {
        var adminService = new AdminService();
        var result = await adminService.updateUser(req.params.id, req.body, req.user.id);
        if (!result.status) return res.status(TYPE_TO_STATUS[result.type] || HTTP_STATUS.BAD_REQUEST).json(HelperUtils.errorResponse(result.message));
        res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse('Cập nhật user thành công'));
    } catch (error) {
        Logger.error('Update user error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
});

// DELETE /api/admin/users/:id
router.delete("/users/:id", async function (req, res) {
    try {
        var adminService = new AdminService();
        var result = await adminService.deleteUser(req.params.id, req.user.id);
        if (!result.status) return res.status(TYPE_TO_STATUS[result.type] || HTTP_STATUS.BAD_REQUEST).json(HelperUtils.errorResponse(result.message));
        res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse('Xóa user thành công'));
    } catch (error) {
        Logger.error('Delete user error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
});

// PATCH /api/admin/users/:id/toggle-active
router.patch("/users/:id/toggle-active", async function (req, res) {
    try {
        var adminService = new AdminService();
        var result = await adminService.toggleUserActive(req.params.id);
        if (!result.status) return res.status(TYPE_TO_STATUS[result.type] || HTTP_STATUS.BAD_REQUEST).json(HelperUtils.errorResponse(result.message));
        res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse("User " + (result.isActive ? 'kích hoạt' : 'khóa') + " thành công"));
    } catch (error) {
        Logger.error('Toggle user active error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
});

// GET /api/admin/exams
router.get("/exams", async function (req, res) {
    try {
        var adminService = new AdminService();
        var { page = 1, limit = 10, search = '' } = req.query;
        var data = await adminService.getAdminExams({ page, limit, search });
        res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse('Thành công', data));
    } catch (error) {
        Logger.error('Get admin exams error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
});

// DELETE /api/admin/exams/:id
router.delete("/exams/:id", async function (req, res) {
    try {
        var adminService = new AdminService();
        var result = await adminService.deleteAdminExam(req.params.id, req.user.id);
        if (!result.status) return res.status(TYPE_TO_STATUS[result.type] || HTTP_STATUS.BAD_REQUEST).json(HelperUtils.errorResponse(result.message));
        res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse('Xóa đề thi thành công'));
    } catch (error) {
        Logger.error('Delete admin exam error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
});

// GET /api/admin/rooms
router.get("/rooms", async function (req, res) {
    try {
        var adminService = new AdminService();
        var { page = 1, limit = 20 } = req.query;
        var data = await adminService.getAdminRooms({ page, limit });
        res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse('Thành công', data));
    } catch (error) {
        Logger.error('Get admin rooms error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
});

// GET /api/admin/results
router.get("/results", async function (req, res) {
    try {
        var adminService = new AdminService();
        var { page = 1, limit = 20 } = req.query;
        var data = await adminService.getAdminResults({ page, limit });
        res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse('Thành công', data));
    } catch (error) {
        Logger.error('Get admin results error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
});

module.exports = router;

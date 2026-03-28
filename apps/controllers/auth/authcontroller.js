var express = require("express");
var router = express.Router();
var AuthService = require(global.__basedir + "/apps/Services/AuthService");
var AuthMiddleware = require(global.__basedir + "/apps/middlewares/auth");
var ValidationMiddleware = require(global.__basedir + "/apps/middlewares/validate");
var { registerValidator, loginValidator } = require(global.__basedir + "/apps/validators/authValidator");
var HelperUtils = require(global.__basedir + "/apps/utils/helpers");
var Logger = require(global.__basedir + "/apps/utils/logger");
var { HTTP_STATUS, MESSAGES } = require(global.__basedir + "/apps/utils/constants");

var TYPE_TO_STATUS = {
    CONFLICT: HTTP_STATUS.CONFLICT,
    UNAUTHORIZED: HTTP_STATUS.UNAUTHORIZED,
    FORBIDDEN: HTTP_STATUS.FORBIDDEN,
    NOT_FOUND: HTTP_STATUS.NOT_FOUND,
    BAD_REQUEST: HTTP_STATUS.BAD_REQUEST
};

// POST /api/auth/register
router.post("/register", registerValidator, ValidationMiddleware.validate, async function (req, res) {
    try {
        var authService = new AuthService();
        var data = await authService.register(req.body);
        if (!data.status) return res.status(TYPE_TO_STATUS[data.type] || HTTP_STATUS.BAD_REQUEST).json(HelperUtils.errorResponse(data.message));
        res.status(HTTP_STATUS.CREATED).json(HelperUtils.successResponse(MESSAGES.REGISTER_SUCCESS, data));
    } catch (error) {
        Logger.error('Register error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
});

// POST /api/auth/login
router.post("/login", loginValidator, ValidationMiddleware.validate, async function (req, res) {
    try {
        var authService = new AuthService();
        var data = await authService.login(req.body);
        if (!data.status) return res.status(TYPE_TO_STATUS[data.type] || HTTP_STATUS.BAD_REQUEST).json(HelperUtils.errorResponse(data.message));
        res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse(MESSAGES.LOGIN_SUCCESS, data));
    } catch (error) {
        Logger.error('Login error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
});

// GET /api/auth/me
router.get("/me", AuthMiddleware.authenticate, async function (req, res) {
    try {
        var authService = new AuthService();
        var result = await authService.getMe(req.user.id);
        if (!result.status) return res.status(TYPE_TO_STATUS[result.type] || HTTP_STATUS.BAD_REQUEST).json(HelperUtils.errorResponse(result.message));
        res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse('Thành công', result.data));
    } catch (error) {
        Logger.error('Get me error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
});

// PUT /api/auth/profile
router.put("/profile", AuthMiddleware.authenticate, async function (req, res) {
    try {
        var authService = new AuthService();
        var data = await authService.updateProfile(req.user.id, req.body);
        if (!data.status) return res.status(TYPE_TO_STATUS[data.type] || HTTP_STATUS.BAD_REQUEST).json(HelperUtils.errorResponse(data.message));
        res.status(HTTP_STATUS.OK).json(HelperUtils.successResponse('Cập nhật thành công', data));
    } catch (error) {
        Logger.error('Update profile error:', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(HelperUtils.errorResponse(MESSAGES.ERROR));
    }
});

module.exports = router;

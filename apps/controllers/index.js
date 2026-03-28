var express = require("express");
var router = express.Router();

router.use("/api/auth", require(__dirname + "/auth/authcontroller"));
router.use("/api/exams", require(__dirname + "/exam/examcontroller"));
router.use("/api/rooms", require(__dirname + "/room/roomcontroller"));
router.use("/api/results", require(__dirname + "/result/resultcontroller"));
router.use("/api/admin", require(__dirname + "/admin/admincontroller"));

module.exports = router;

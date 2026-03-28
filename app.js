var express = require('express');
var cors = require('cors');
var path = require('path');
var bodyParser = require('body-parser');
var { Server } = require('socket.io');
var http = require('http');
var swaggerUi = require('swagger-ui-express');
var swaggerSpec = require('./Config/swagger');

global.__basedir = __dirname;

var config = require('./Config/Setting.json');

var { connectDB } = require('./Config/database');
var ErrorHandler = require('./apps/middlewares/errorHandler');
var Logger = require('./apps/utils/logger');
var controller = require('./apps/controllers');

var app = express();
var server = http.createServer(app);
var io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/pages', express.static(path.join(__dirname, 'apps/views')));

app.use(controller);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'ExamPro API Docs',
  customfavIcon: '/favicon.ico'
}));

app.get('/api/health', function (req, res) {
  res.status(200).json({ success: true, message: 'Server is running', timestamp: new Date().toISOString() });
});

app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'apps/views/index.html'));
});

var roomStudents = new Map();

// Socket.io - Real-time monitoring & exam functionality
io.on('connection', function (socket) {
  Logger.info('Socket connected: ' + socket.id);

  socket.on('student-join-room', function ({ roomCode, studentId, studentName }) {
    socket.join(roomCode);
    socket.roomCode = roomCode;
    socket.studentId = studentId;
    socket.studentName = studentName;

    if (!roomStudents.has(roomCode)) roomStudents.set(roomCode, new Map());
    roomStudents.get(roomCode).set(socket.id, {
      socketId: socket.id, studentId,
      studentName: studentName || 'Học sinh',
      answeredCount: 0, totalQuestions: 0, timeLeft: 0,
      status: 'in-progress', joinedAt: new Date().toISOString()
    });

    var students = Array.from(roomStudents.get(roomCode).values());
    io.to('monitor-' + roomCode).emit('room-state', { students });
    Logger.info('Student ' + studentName + ' (' + studentId + ') joined room: ' + roomCode);
  });

  socket.on('teacher-monitor', function (roomCode) {
    socket.join('monitor-' + roomCode);
    var students = roomStudents.get(roomCode);
    socket.emit('room-state', { students: students ? Array.from(students.values()) : [] });
    Logger.info('Teacher monitoring room: ' + roomCode);
  });

  socket.on('progress-update', function ({ roomCode, answeredCount, totalQuestions, timeLeft }) {
    var students = roomStudents.get(roomCode);
    if (students && students.has(socket.id)) {
      var s = students.get(socket.id);
      s.answeredCount = answeredCount;
      s.totalQuestions = totalQuestions;
      s.timeLeft = timeLeft;
      s.lastActivity = new Date().toISOString();
    }
    socket.to('monitor-' + roomCode).emit('student-progress', {
      socketId: socket.id, studentId: socket.studentId,
      answeredCount, totalQuestions, timeLeft
    });
  });

  socket.on('student-submitted', function ({ roomCode }) {
    var students = roomStudents.get(roomCode);
    if (students && students.has(socket.id)) students.get(socket.id).status = 'submitted';
    var updatedStudents = students ? Array.from(students.values()) : [];
    io.to('monitor-' + roomCode).emit('room-state', { students: updatedStudents });
    Logger.info('Student ' + socket.studentId + ' submitted in room: ' + roomCode);
  });

  socket.on('force-submit-room', function (roomCode) {
    io.to(roomCode).emit('force-submit', { reason: 'Giáo viên đã kết thúc bài thi' });
    Logger.info('Force submit triggered for room: ' + roomCode);
  });

  socket.on('join-room', function (roomCode) {
    socket.join(roomCode);
    io.to(roomCode).emit('user-joined', { message: 'A student has joined the room' });
  });

  socket.on('start-exam', function (roomCode) {
    io.to(roomCode).emit('exam-started', { message: 'Exam has started', timestamp: new Date().toISOString() });
  });

  socket.on('submit-exam', function (data) {
    io.to(data.roomCode).emit('exam-submitted', { studentId: socket.id, timestamp: new Date().toISOString() });
  });

  socket.on('disconnect', function () {
    if (socket.roomCode) {
      var students = roomStudents.get(socket.roomCode);
      if (students) {
        students.delete(socket.id);
        var updatedStudents = Array.from(students.values());
        io.to('monitor-' + socket.roomCode).emit('room-state', { students: updatedStudents });
        if (students.size === 0) roomStudents.delete(socket.roomCode);
      }
    }
    Logger.info('Socket disconnected: ' + socket.id);
  });
});

app.use(ErrorHandler.notFound);
app.use(ErrorHandler.handleError);

var PORT = config.server.port || 5000;

async function startServer() {
  try {
    await connectDB();
    var db = require('./Config/database');
    await db.sequelize.sync({ force: false });
    console.log('Tat ca tables da san sang!');
    server.on('error', function (err) {
      if (err.code === 'EADDRINUSE') {
        console.error('Cong ' + PORT + ' dang bi chiem. Hay dong chuong trinh cu truoc roi chay lai.');
      } else {
        console.error('Loi server:', err.message);
      }
      process.exit(1);
    });

    server.listen(PORT, function () {
      console.log('Server running on port ' + PORT);
      console.log('Frontend: http://localhost:' + PORT);
      console.log('Database: ' + config.database.name);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

process.on('unhandledRejection', function (err) {
  console.error('Unhandled Promise Rejection:', err);
  server.close(function () { process.exit(1); });
});

startServer();
module.exports = { app, server, io };

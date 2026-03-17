// =====================================================
// SERVER.JS - MAIN SERVER FILE
// =====================================================
// 👤 Người làm: NGƯỜI 3 (Admin Module)
// 📝 Mô tả: File chính khởi tạo Express server, kết nối database,
//          setup routes, Socket.io, và middleware
// =====================================================

const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const http = require('http');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// Load environment variables
dotenv.config();

// Import database connection
const { connectDB } = require('./config/database');

// Import middleware classes (OOP)
const ErrorHandler = require('./middleware/errorHandler');
const Logger = require('./utils/logger');

// Import routes (OOP)
const authRoutes = require('./routes/auth');
const examRoutes = require('./routes/exams');
const roomRoutes = require('./routes/rooms');
const resultRoutes = require('./routes/results');
const adminRoutes = require('./routes/admin');

// Initialize Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (Frontend)
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes (OOP Class-based Controllers)
app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/admin', adminRoutes);

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'ExamPro API Docs',
  customfavIcon: '/favicon.ico'
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend pages
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Track students per room: roomCode -> Map(socketId -> studentData)
const roomStudents = new Map();

// Socket.io - Real-time monitoring & exam functionality
io.on('connection', (socket) => {
  Logger.info(`Socket connected: ${socket.id}`);

  // --- STUDENT joins exam room ---
  socket.on('student-join-room', ({ roomCode, studentId, studentName }) => {
    socket.join(roomCode);
    socket.roomCode = roomCode;
    socket.studentId = studentId;
    socket.studentName = studentName;

    if (!roomStudents.has(roomCode)) roomStudents.set(roomCode, new Map());
    roomStudents.get(roomCode).set(socket.id, {
      socketId: socket.id,
      studentId,
      studentName: studentName || 'Học sinh',
      answeredCount: 0,
      totalQuestions: 0,
      timeLeft: 0,
      status: 'in-progress',
      joinedAt: new Date().toISOString()
    });

    const students = Array.from(roomStudents.get(roomCode).values());
    io.to(`monitor-${roomCode}`).emit('room-state', { students });
    Logger.info(`Student ${studentName} (${studentId}) joined room: ${roomCode}`);
  });

  // --- TEACHER monitors a room ---
  socket.on('teacher-monitor', (roomCode) => {
    socket.join(`monitor-${roomCode}`);
    const students = roomStudents.get(roomCode);
    socket.emit('room-state', { students: students ? Array.from(students.values()) : [] });
    Logger.info(`Teacher monitoring room: ${roomCode}`);
  });

  // --- Student sends progress update ---
  socket.on('progress-update', ({ roomCode, answeredCount, totalQuestions, timeLeft }) => {
    const students = roomStudents.get(roomCode);
    if (students && students.has(socket.id)) {
      const s = students.get(socket.id);
      s.answeredCount = answeredCount;
      s.totalQuestions = totalQuestions;
      s.timeLeft = timeLeft;
      s.lastActivity = new Date().toISOString();
    }
    socket.to(`monitor-${roomCode}`).emit('student-progress', {
      socketId: socket.id,
      studentId: socket.studentId,
      answeredCount,
      totalQuestions,
      timeLeft
    });
  });

  // --- Student submitted exam ---
  socket.on('student-submitted', ({ roomCode }) => {
    const students = roomStudents.get(roomCode);
    if (students && students.has(socket.id)) {
      students.get(socket.id).status = 'submitted';
    }
    const updatedStudents = students ? Array.from(students.values()) : [];
    io.to(`monitor-${roomCode}`).emit('room-state', { students: updatedStudents });
    Logger.info(`Student ${socket.studentId} submitted in room: ${roomCode}`);
  });

  // --- Teacher force-submits all students in room ---
  socket.on('force-submit-room', (roomCode) => {
    io.to(roomCode).emit('force-submit', { reason: 'Giáo viên đã kết thúc bài thi' });
    Logger.info(`Force submit triggered for room: ${roomCode}`);
  });

  // --- Legacy events (backward compat) ---
  socket.on('join-room', (roomCode) => {
    socket.join(roomCode);
    io.to(roomCode).emit('user-joined', { message: 'A student has joined the room' });
  });

  socket.on('start-exam', (roomCode) => {
    io.to(roomCode).emit('exam-started', {
      message: 'Exam has started',
      timestamp: new Date().toISOString()
    });
  });

  socket.on('submit-exam', (data) => {
    io.to(data.roomCode).emit('exam-submitted', {
      studentId: socket.id,
      timestamp: new Date().toISOString()
    });
  });

  // --- Disconnect cleanup ---
  socket.on('disconnect', () => {
    if (socket.roomCode) {
      const students = roomStudents.get(socket.roomCode);
      if (students) {
        students.delete(socket.id);
        const updatedStudents = Array.from(students.values());
        io.to(`monitor-${socket.roomCode}`).emit('room-state', { students: updatedStudents });
        if (students.size === 0) roomStudents.delete(socket.roomCode);
      }
    }
    Logger.info(`Socket disconnected: ${socket.id}`);
  });
});

// Error handling middleware (OOP)
app.use(ErrorHandler.notFound);
app.use(ErrorHandler.handleError);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Sync all models (create tables if not exist, keep existing data)
    const { sequelize } = require('./config/database');
    await sequelize.sync({ force: false });
    console.log('✅ Tất cả tables đã sẵn sàng!');
    
    // Start listening
    server.listen(PORT, () => {
      console.log('');
      console.log('🚀 ====================================');
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📁 Frontend: http://localhost:${PORT}`);
      console.log(`🔌 Socket.io: http://localhost:${PORT}`);
      console.log(`💾 Database: ${process.env.DB_NAME}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log('🚀 ====================================');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  server.close(() => process.exit(1));
});

// Start the server
startServer();

// Export for testing
module.exports = { app, server, io };

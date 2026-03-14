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

// Socket.io - Real-time functionality
io.on('connection', (socket) => {
  Logger.info(`User connected: ${socket.id}`);

  // Join exam room
  socket.on('join-room', (roomCode) => {
    socket.join(roomCode);
    Logger.info(`User ${socket.id} joined room: ${roomCode}`);
    io.to(roomCode).emit('user-joined', {
      message: 'A student has joined the room'
    });
  });

  // Start exam
  socket.on('start-exam', (roomCode) => {
    io.to(roomCode).emit('exam-started', {
      message: 'Exam has started',
      timestamp: new Date().toISOString()
    });
  });

  // Submit exam
  socket.on('submit-exam', (data) => {
    io.to(data.roomCode).emit('exam-submitted', {
      studentId: socket.id,
      timestamp: new Date().toISOString()
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    Logger.info(`User disconnected: ${socket.id}`);
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

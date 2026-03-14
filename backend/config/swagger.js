// =====================================================
// SWAGGER CONFIGURATION
// =====================================================

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ExamPro API Documentation',
      version: '1.0.0',
      description: 'API documentation for ExamPro - Online Examination System',
      contact: {
        name: 'ExamPro Team',
        email: 'support@exampro.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://api.exampro.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from login'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            fullName: { type: 'string', example: 'Nguyen Van A' },
            email: { type: 'string', format: 'email', example: 'student@test.com' },
            role: { type: 'string', enum: ['student', 'teacher', 'admin'], example: 'student' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Exam: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Đề thi Toán lớp 12' },
            description: { type: 'string', example: 'Đề thi học kỳ 1' },
            duration: { type: 'integer', example: 90, description: 'Duration in minutes' },
            totalQuestions: { type: 'integer', example: 50 },
            teacherId: { type: 'integer', example: 2 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Question: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            examId: { type: 'integer', example: 1 },
            question: { type: 'string', example: 'What is 2+2?' },
            optionA: { type: 'string', example: '3' },
            optionB: { type: 'string', example: '4' },
            optionC: { type: 'string', example: '5' },
            optionD: { type: 'string', example: '6' },
            correctAnswer: { type: 'string', enum: ['A', 'B', 'C', 'D'], example: 'B' },
            order: { type: 'integer', example: 1 }
          }
        },
        ExamRoom: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            examId: { type: 'integer', example: 1 },
            roomCode: { type: 'string', example: 'ABC123' },
            startTime: { type: 'string', format: 'date-time' },
            endTime: { type: 'string', format: 'date-time' },
            maxParticipants: { type: 'integer', example: 50 },
            currentParticipants: { type: 'integer', example: 25 },
            status: { type: 'string', enum: ['pending', 'active', 'completed', 'cancelled'], example: 'active' },
            createdBy: { type: 'integer', example: 2 }
          }
        },
        Result: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            studentId: { type: 'integer', example: 3 },
            roomId: { type: 'integer', example: 1 },
            score: { type: 'number', format: 'float', example: 8.5 },
            correctAnswers: { type: 'integer', example: 42 },
            totalQuestions: { type: 'integer', example: 50 },
            answers: { type: 'string', description: 'JSON string of student answers' },
            submittedAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' },
            errors: { type: 'object' }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation successful' },
            data: { type: 'object' }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization'
      },
      {
        name: 'Exams',
        description: 'Exam management (Teacher)'
      },
      {
        name: 'Rooms',
        description: 'Exam room management'
      },
      {
        name: 'Results',
        description: 'Exam results and submissions'
      },
      {
        name: 'Admin',
        description: 'Admin operations (Admin only)'
      }
    ]
  },
  apis: ['./backend/routes/*.js'] // Path to API routes
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

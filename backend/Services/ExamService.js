// =====================================================
// EXAM SERVICE - Business Logic quản lý đề thi
// =====================================================

const ExamRepository = require('../Repository/ExamRepository');
const QuestionRepository = require('../Repository/QuestionRepository');
const Logger = require('../utils/logger');

class ExamService {
  static async getExams({ page = 1, limit = 10, search = '', user }) {
    const teacherId = user.role === 'teacher' ? user.id : null;
    const { count, rows } = await ExamRepository.getList({ page, limit, search, teacherId });

    return {
      exams: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    };
  }

  static async getExamById(id) {
    const exam = await ExamRepository.findByIdWithDetails(id);
    if (!exam) {
      throw { type: 'NOT_FOUND', message: 'Đề thi không tồn tại' };
    }
    return exam;
  }

  static async createExam({ title, description, duration, questions }, teacherId) {
    const exam = await ExamRepository.create({
      title,
      description,
      duration,
      teacherId,
      totalQuestions: questions.length
    });

    const questionData = questions.map((q, index) => ({
      examId: exam.id,
      question: q.question,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctAnswer: q.correctAnswer,
      order: index + 1
    }));

    await QuestionRepository.bulkCreate(questionData);

    Logger.info(`Exam created: ${exam.id} by teacher ${teacherId}`);
    return { examId: exam.id };
  }

  static async updateExam(id, { title, description, duration }, user) {
    const exam = await ExamRepository.findById(id);
    if (!exam) {
      throw { type: 'NOT_FOUND', message: 'Đề thi không tồn tại' };
    }
    if (exam.teacherId !== user.id && user.role !== 'admin') {
      throw { type: 'FORBIDDEN', message: 'Không có quyền thực hiện' };
    }

    await ExamRepository.update(exam, { title, description, duration });
    Logger.info(`Exam updated: ${id}`);
  }

  static async deleteExam(id, user) {
    const exam = await ExamRepository.findById(id);
    if (!exam) {
      throw { type: 'NOT_FOUND', message: 'Đề thi không tồn tại' };
    }
    if (exam.teacherId !== user.id && user.role !== 'admin') {
      throw { type: 'FORBIDDEN', message: 'Không có quyền thực hiện' };
    }

    await ExamRepository.delete(exam);
    Logger.info(`Exam deleted: ${id}`);
  }
}

module.exports = ExamService;

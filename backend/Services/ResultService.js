// =====================================================
// RESULT SERVICE - Business Logic quản lý kết quả thi
// =====================================================

const ResultRepository = require('../Repository/ResultRepository');
const ExamRoomRepository = require('../Repository/ExamRoomRepository');
const HelperUtils = require('../utils/helpers');
const Logger = require('../utils/logger');

class ResultService {
  static async submitExam({ roomId, answers }, userId) {
    // Lấy phòng thi kèm đề thi và câu hỏi để tính điểm
    const room = await ExamRoomRepository.findByIdWithExamAndQuestions(roomId);
    if (!room) {
      throw { type: 'NOT_FOUND', message: 'Phòng thi không tồn tại' };
    }

    const existingResult = await ResultRepository.findByStudentAndRoom(userId, roomId);
    if (existingResult) {
      throw { type: 'BAD_REQUEST', message: 'Bạn đã nộp bài thi này rồi' };
    }

    const questions = room.exam.questions;
    const { correctAnswers, score, correctAnswerMap } = HelperUtils.calculateScore(
      answers,
      questions
    );

    const result = await ResultRepository.create({
      studentId: userId,
      roomId,
      answers,
      correctAnswers,
      score,
      totalQuestions: questions.length
    });

    Logger.info(`Exam submitted: student ${userId}, room ${roomId}, score ${score}`);
    return {
      resultId: result.id,
      score: result.score,
      correctAnswers: result.correctAnswers,
      totalQuestions: result.totalQuestions,
      correctAnswerMap
    };
  }

  static async getMyResults(studentId) {
    const rows = await ResultRepository.findByStudent(studentId);
    return {
      results: rows,
      pagination: { total: rows.length, page: 1, limit: rows.length, totalPages: 1 }
    };
  }

  static async getResultById(id, user) {
    const result = await ResultRepository.findById(id);
    if (!result) {
      throw { type: 'NOT_FOUND', message: 'Kết quả không tồn tại' };
    }

    const isOwner = result.studentId === user.id;
    const isTeacher = user.role === 'teacher';
    const isAdmin = user.role === 'admin';
    if (!isOwner && !isTeacher && !isAdmin) {
      throw { type: 'FORBIDDEN', message: 'Không có quyền thực hiện' };
    }

    return result;
  }

  static async getResultsByRoom(roomId, { page = 1, limit = 20 }, user) {
    const room = await ExamRoomRepository.findById(roomId);
    if (!room) {
      throw { type: 'NOT_FOUND', message: 'Phòng thi không tồn tại' };
    }
    if (room.createdBy !== user.id && user.role !== 'admin') {
      throw { type: 'FORBIDDEN', message: 'Không có quyền thực hiện' };
    }

    const { count, rows } = await ResultRepository.findByRoom(roomId, { page, limit });
    return {
      results: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    };
  }

  static async deleteResult(id) {
    const result = await ResultRepository.findById(id);
    if (!result) {
      throw { type: 'NOT_FOUND', message: 'Kết quả không tồn tại' };
    }
    await ResultRepository.delete(result);
    Logger.info(`Result deleted: ${id}`);
  }
}

module.exports = ResultService;

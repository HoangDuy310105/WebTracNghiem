// =====================================================
// RESULT ENTITY - POJO đại diện cấu trúc dữ liệu Result
// =====================================================

class ResultEntity {
  constructor({ id, studentId, roomId, answers, correctAnswers, totalQuestions, score, timeSpent, submittedAt } = {}) {
    this.id = id;
    this.studentId = studentId;
    this.roomId = roomId;
    this.answers = answers;
    this.correctAnswers = correctAnswers;
    this.totalQuestions = totalQuestions;
    this.score = score;
    this.timeSpent = timeSpent;
    this.submittedAt = submittedAt;
  }
}

module.exports = ResultEntity;

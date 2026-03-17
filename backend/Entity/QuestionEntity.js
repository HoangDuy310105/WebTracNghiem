// =====================================================
// QUESTION ENTITY - POJO đại diện cấu trúc dữ liệu Question
// =====================================================

class QuestionEntity {
  constructor({ id, examId, question, optionA, optionB, optionC, optionD, correctAnswer, order } = {}) {
    this.id = id;
    this.examId = examId;
    this.question = question;
    this.optionA = optionA;
    this.optionB = optionB;
    this.optionC = optionC;
    this.optionD = optionD;
    this.correctAnswer = correctAnswer;
    this.order = order;
  }
}

module.exports = QuestionEntity;

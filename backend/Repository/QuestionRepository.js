// =====================================================
// QUESTION REPOSITORY - Data Access Layer cho Question
// =====================================================

const { Question } = require('../models');

class QuestionRepository {
  static async bulkCreate(data) {
    return Question.bulkCreate(data);
  }

  static async findByExamId(examId) {
    return Question.findAll({ where: { examId } });
  }
}

module.exports = QuestionRepository;

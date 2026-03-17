// =====================================================
// EXAM ENTITY - POJO đại diện cấu trúc dữ liệu Exam
// =====================================================

class ExamEntity {
  constructor({ id, title, description, duration, teacherId, totalQuestions, isActive } = {}) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.duration = duration;
    this.teacherId = teacherId;
    this.totalQuestions = totalQuestions;
    this.isActive = isActive;
  }
}

module.exports = ExamEntity;

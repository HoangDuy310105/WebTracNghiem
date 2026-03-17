// =====================================================
// EXAM MODEL - BẢNG ĐỀ THI
// =====================================================

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Exam = sequelize.define('Exam', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    duration: {
      type: DataTypes.INTEGER, // Phút
      allowNull: false,
      defaultValue: 45
    },
    teacherId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'teacher_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    totalQuestions: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'total_questions'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
  }, {
    tableName: 'exams',
    timestamps: true,
    underscored: true
  });

  // Associations
  Exam.associate = (models) => {
    // Exam thuộc về Teacher
    Exam.belongsTo(models.User, {
      foreignKey: 'teacherId',
      as: 'teacher'
    });

    // Exam có nhiều Question
    Exam.hasMany(models.Question, {
      foreignKey: 'examId',
      as: 'questions',
      onDelete: 'CASCADE'
    });

    // Exam có nhiều Room
    Exam.hasMany(models.ExamRoom, {
      foreignKey: 'examId',
      as: 'rooms'
    });
  };

  return Exam;
};

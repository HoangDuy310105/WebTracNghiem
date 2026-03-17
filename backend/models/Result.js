// =====================================================
// RESULT MODEL - BẢNG KẾT QUẢ THI
// =====================================================

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Result = sequelize.define('Result', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'student_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    roomId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'room_id',
      references: {
        model: 'exam_rooms',
        key: 'id'
      }
    },
    answers: {
      type: DataTypes.TEXT, // NVARCHAR(MAX) cho SQL Server - lưu JSON string
      allowNull: false,
      get() {
        const rawValue = this.getDataValue('answers');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('answers', JSON.stringify(value));
      }
    },
    correctAnswers: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'correct_answers'
    },
    totalQuestions: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'total_questions'
    },
    score: {
      type: DataTypes.DECIMAL(5, 2), // VD: 8.75
      defaultValue: 0.00
    },
    timeSpent: {
      type: DataTypes.INTEGER, // Giây
      defaultValue: 0,
      field: 'time_spent'
    },
    submittedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'submitted_at'
    },
  }, {
    tableName: 'results',
    timestamps: true,
    underscored: true
  });

  // Associations
  Result.associate = (models) => {
    // Result thuộc về Student
    Result.belongsTo(models.User, {
      foreignKey: 'studentId',
      as: 'student',
      onDelete: 'NO ACTION'
    });

    // Result thuộc về Room (exam info có thể lấy qua room.exam)
    Result.belongsTo(models.ExamRoom, {
      foreignKey: 'roomId',
      as: 'room',
      onDelete: 'NO ACTION'
    });
  };

  return Result;
};

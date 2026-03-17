// =====================================================
// EXAM ROOM MODEL - BẢNG PHÒNG THI
// =====================================================

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ExamRoom = sequelize.define('ExamRoom', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    roomCode: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
      field: 'room_code'
    },
    examId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'exam_id',
      references: {
        model: 'exams',
        key: 'id'
      }
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'created_by',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'start_time'
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'end_time'
    },
    status: {
      type: DataTypes.ENUM('pending', 'active', 'completed', 'cancelled'),
      defaultValue: 'pending'
    },
    maxParticipants: {
      type: DataTypes.INTEGER,
      defaultValue: 100,
      field: 'max_participants'
    },
    currentParticipants: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'current_participants'
    },
  }, {
    tableName: 'exam_rooms',
    timestamps: true,
    underscored: true
  });

  // Associations
  ExamRoom.associate = (models) => {
    // Room thuộc về Creator (Teacher/Admin)
    ExamRoom.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });

    // Room thuộc về Exam
    ExamRoom.belongsTo(models.Exam, {
      foreignKey: 'examId',
      as: 'exam'
    });

    // Room có nhiều Result
    ExamRoom.hasMany(models.Result, {
      foreignKey: 'roomId',
      as: 'results',
      onDelete: 'NO ACTION'
    });
  };

  return ExamRoom;
};

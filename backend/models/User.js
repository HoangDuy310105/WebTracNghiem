// =====================================================
// USER MODEL - BẢNG NGƯỜI DÙNG
// =====================================================

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    fullName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'full_name'
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('student', 'teacher', 'admin'),
      allowNull: false,
      defaultValue: 'student'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true
  });

  // Associations
  User.associate = (models) => {
    // Teacher có nhiều Exam
    User.hasMany(models.Exam, {
      foreignKey: 'teacherId',
      as: 'exams'
    });

    // Teacher có nhiều Room
    User.hasMany(models.ExamRoom, {
      foreignKey: 'createdBy',
      as: 'rooms'
    });

    // Student có nhiều Result
    User.hasMany(models.Result, {
      foreignKey: 'studentId',
      as: 'results',
      onDelete: 'NO ACTION'
    });
  };

  return User;
};

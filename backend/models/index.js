// =====================================================
// INDEX MODEL - KHỞI TẠO VÀ QUẢN LÝ TẤT CẢ MODELS
// =====================================================

const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

// Import models
const User = require('./User')(sequelize, DataTypes);
const Exam = require('./Exam')(sequelize, DataTypes);
const Question = require('./Question')(sequelize, DataTypes);
const ExamRoom = require('./ExamRoom')(sequelize, DataTypes);
const Result = require('./Result')(sequelize, DataTypes);

// Tạo object chứa tất cả models
const models = {
  User,
  Exam,
  Question,
  ExamRoom,
  Result
};

// Thiết lập associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = {
  sequelize,
  ...models
};

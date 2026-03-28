const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../../../Config/database');

class ExamModel extends Model {
    static associate(models) {
        ExamModel.belongsTo(models.UserModel, { foreignKey: 'teacherId', as: 'teacher' });
        ExamModel.hasMany(models.QuestionModel, { foreignKey: 'examId', as: 'questions', onDelete: 'CASCADE' });
        ExamModel.hasMany(models.ExamRoomModel, { foreignKey: 'examId', as: 'rooms' });
    }
}

ExamModel.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING(200), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    duration: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 45 },
    teacherId: { type: DataTypes.INTEGER, allowNull: false, field: 'teacher_id', references: { model: 'users', key: 'id' } },
    totalQuestions: { type: DataTypes.INTEGER, defaultValue: 0, field: 'total_questions' },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
}, {
    sequelize,
    tableName: 'exams',
    timestamps: true,
    underscored: true
});

module.exports = ExamModel;

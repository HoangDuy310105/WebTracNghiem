const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../../../Config/database');

class QuestionModel extends Model {
    static associate(models) {
        QuestionModel.belongsTo(models.ExamModel, { foreignKey: 'examId', as: 'exam' });
    }
}

QuestionModel.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    examId: { type: DataTypes.INTEGER, allowNull: false, field: 'exam_id', references: { model: 'exams', key: 'id' } },
    question: { type: DataTypes.TEXT, allowNull: false },
    optionA: { type: DataTypes.TEXT, allowNull: false, field: 'option_a' },
    optionB: { type: DataTypes.TEXT, allowNull: false, field: 'option_b' },
    optionC: { type: DataTypes.TEXT, allowNull: false, field: 'option_c' },
    optionD: { type: DataTypes.TEXT, allowNull: false, field: 'option_d' },
    correctAnswer: { type: DataTypes.ENUM('A', 'B', 'C', 'D'), allowNull: false, field: 'correct_answer' },
    order: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
    sequelize,
    tableName: 'questions',
    timestamps: true,
    underscored: true
});

module.exports = QuestionModel;

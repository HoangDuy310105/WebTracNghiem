const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../../../Config/database');

class ResultModel extends Model {
    static associate(models) {
        ResultModel.belongsTo(models.UserModel, { foreignKey: 'studentId', as: 'student', onDelete: 'NO ACTION' });
        ResultModel.belongsTo(models.ExamRoomModel, { foreignKey: 'roomId', as: 'room', onDelete: 'NO ACTION' });
    }
}

ResultModel.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    studentId: { type: DataTypes.INTEGER, allowNull: false, field: 'student_id', references: { model: 'users', key: 'id' } },
    roomId: { type: DataTypes.INTEGER, allowNull: false, field: 'room_id', references: { model: 'exam_rooms', key: 'id' } },
    answers: {
        type: DataTypes.TEXT,
        allowNull: false,
        get() { const raw = this.getDataValue('answers'); return raw ? JSON.parse(raw) : []; },
        set(value) { this.setDataValue('answers', JSON.stringify(value)); }
    },
    correctAnswers: { type: DataTypes.INTEGER, defaultValue: 0, field: 'correct_answers' },
    totalQuestions: { type: DataTypes.INTEGER, allowNull: false, field: 'total_questions' },
    score: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0.00 },
    timeSpent: { type: DataTypes.INTEGER, defaultValue: 0, field: 'time_spent' },
    submittedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: 'submitted_at' },
}, {
    sequelize,
    tableName: 'results',
    timestamps: true,
    underscored: true
});

module.exports = ResultModel;

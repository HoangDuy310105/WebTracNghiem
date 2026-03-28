const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../../../Config/database');

class ExamRoomModel extends Model {
    static associate(models) {
        ExamRoomModel.belongsTo(models.UserModel, { foreignKey: 'createdBy', as: 'creator' });
        ExamRoomModel.belongsTo(models.ExamModel, { foreignKey: 'examId', as: 'exam' });
        ExamRoomModel.hasMany(models.ResultModel, { foreignKey: 'roomId', as: 'results', onDelete: 'NO ACTION' });
    }
}

ExamRoomModel.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    roomCode: { type: DataTypes.STRING(10), allowNull: false, unique: true, field: 'room_code' },
    examId: { type: DataTypes.INTEGER, allowNull: false, field: 'exam_id', references: { model: 'exams', key: 'id' } },
    createdBy: { type: DataTypes.INTEGER, allowNull: false, field: 'created_by', references: { model: 'users', key: 'id' } },
    startTime: { type: DataTypes.DATE, allowNull: false, field: 'start_time' },
    endTime: { type: DataTypes.DATE, allowNull: false, field: 'end_time' },
    status: { type: DataTypes.ENUM('pending', 'active', 'completed', 'cancelled'), defaultValue: 'pending' },
    maxParticipants: { type: DataTypes.INTEGER, defaultValue: 100, field: 'max_participants' },
    currentParticipants: { type: DataTypes.INTEGER, defaultValue: 0, field: 'current_participants' },
}, {
    sequelize,
    tableName: 'exam_rooms',
    timestamps: true,
    underscored: true
});

module.exports = ExamRoomModel;

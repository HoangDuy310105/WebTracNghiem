const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../../../Config/database');

class UserModel extends Model {
    static associate(models) {
        UserModel.hasMany(models.ExamModel, { foreignKey: 'teacherId', as: 'exams' });
        UserModel.hasMany(models.ExamRoomModel, { foreignKey: 'createdBy', as: 'rooms' });
        UserModel.hasMany(models.ResultModel, { foreignKey: 'studentId', as: 'results', onDelete: 'NO ACTION' });
    }
}

UserModel.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    fullName: { type: DataTypes.STRING(100), allowNull: false, field: 'full_name' },
    email: { type: DataTypes.STRING(100), allowNull: false, unique: true, validate: { isEmail: true } },
    password: { type: DataTypes.STRING(255), allowNull: false },
    role: { type: DataTypes.ENUM('student', 'teacher', 'admin'), allowNull: false, defaultValue: 'student' },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
}, {
    sequelize,
    tableName: 'users',
    timestamps: true,
    underscored: true
});

module.exports = UserModel;

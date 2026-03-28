const UserModel = require('./UserModel');
const ExamModel = require('./ExamModel');
const QuestionModel = require('./QuestionModel');
const ExamRoomModel = require('./ExamRoomModel');
const ResultModel = require('./ResultModel');

const models = { UserModel, ExamModel, QuestionModel, ExamRoomModel, ResultModel };

Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});

module.exports = models;

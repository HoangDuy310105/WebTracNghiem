var { QuestionModel: Question } = require(global.__basedir + '/apps/Database/Models');

class QuestionRepository {
    context;
    session;

    constructor(context, session = null) {
        this.context = context;
        this.session = session;
    }

    async bulkCreate(data) {
        return Question.bulkCreate(data, { transaction: this.session });
    }

    async findByExamId(examId) {
        return Question.findAll({ where: { examId }, transaction: this.session });
    }
}

module.exports = QuestionRepository;

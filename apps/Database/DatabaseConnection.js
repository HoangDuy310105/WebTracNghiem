var config = require(global.__basedir + '/Config/Setting.json');

class DatabaseConnection {
    host;
    user;
    pass;
    name;
    port;
    constructor() {

    }
    getSequelize() {
        this.host = config.database.host;
        this.user = config.database.username;
        this.pass = config.database.password;
        this.name = config.database.name;
        this.port = config.database.port;
        var Sequelize = require('sequelize').Sequelize;
        var client = new Sequelize(this.name, this.user, this.pass, {
            host: this.host,
            port: this.port,
            dialect: 'mssql',
            dialectOptions: {
                options: { encrypt: true, trustServerCertificate: true }
            },
            logging: false,
            pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
        });
        return client;
    }
}

module.exports = DatabaseConnection;

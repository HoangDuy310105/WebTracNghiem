var DatabaseConnection = require(global.__basedir + '/apps/Database/DatabaseConnection');

var sequelize = new DatabaseConnection().getSequelize();

var connectDB = async function() {
    try {
        await sequelize.authenticate();
        console.log('Ket noi SQL Server thanh cong!');
        await sequelize.sync({ force: false });
        console.log('Database da dong bo! Tat ca tables da san sang.');
    } catch (error) {
        console.error('Loi ket noi database:', error.message);
        console.error('Kiem tra: 1. SQL Server da chay chua?  2. Config/Setting.json dung chua?  3. Database WebTracNghiem da tao chua?');
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };

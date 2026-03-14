const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 1433,
    dialect: 'mssql',
    dialectOptions: {
      options: {
        encrypt: true,
        trustServerCertificate: true
      }
    },
    logging: console.log, // Enable logging để debug
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Kết nối SQL Server thành công!');
    
    // Sync models (development only) - TẠM THỜI TẮT ĐỂ TEST
    // if (process.env.NODE_ENV === 'development') {
    //   await sequelize.sync({ alter: false });
    //   console.log('✅ Database đã đồng bộ!');
    // }
    
    console.log('⚠️  Đang chạy ở chế độ NO SYNC - cần tạo tables manually');
  } catch (error) {
    console.error('❌ Lỗi kết nối database:', error.message);
    console.error('');
    console.error('📌 Kiểm tra:');
    console.error('   1. SQL Server đã chạy chưa?');
    console.error('   2. Thông tin trong file .env đúng chưa?');
    console.error('   3. Database "WebTracNghiem" đã tạo chưa?');
    console.error('');
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };

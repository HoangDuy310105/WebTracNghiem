// =====================================================
// TEST DATABASE CONNECTION
// =====================================================
// Chạy file này để test kết nối SQL Server
// Command: node test-connection.js
// =====================================================

const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log('🧪 Testing SQL Server Connection...\n');

// Hiển thị thông tin từ .env
console.log('📝 Configuration:');
console.log(`   Host: ${process.env.DB_HOST}`);
console.log(`   Port: ${process.env.DB_PORT}`);
console.log(`   Database: ${process.env.DB_NAME}`);
console.log(`   User: ${process.env.DB_USER}`);
console.log(`   Password: ${'*'.repeat(process.env.DB_PASSWORD?.length || 0)}`);
console.log('');

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
    logging: false
  }
);

async function testConnection() {
  try {
    console.log('⏳ Connecting to SQL Server...');
    await sequelize.authenticate();
    
    console.log('✅ CONNECTION SUCCESSFUL!\n');
    
    // Get SQL Server version
    const [results] = await sequelize.query('SELECT @@VERSION as version');
    console.log('📊 SQL Server Info:');
    console.log(`   ${results[0].version.split('\n')[0]}`);
    console.log('');
    
    // List databases
    const [databases] = await sequelize.query(
      'SELECT name FROM sys.databases WHERE name = ?',
      { replacements: [process.env.DB_NAME] }
    );
    
    if (databases.length > 0) {
      console.log(`✅ Database "${process.env.DB_NAME}" exists`);
    } else {
      console.log(`❌ Database "${process.env.DB_NAME}" NOT FOUND`);
      console.log(`   Please create it: CREATE DATABASE ${process.env.DB_NAME};`);
    }
    
    console.log('');
    console.log('🎉 All checks passed! You can start the server now.');
    console.log('   Run: npm run dev');
    
  } catch (error) {
    console.error('❌ CONNECTION FAILED!\n');
    console.error('Error:', error.message);
    console.error('');
    console.error('📌 Common solutions:');
    console.error('   1. Check if SQL Server is running');
    console.error('   2. Verify credentials in .env file');
    console.error('   3. Enable SQL Server Authentication');
    console.error('   4. Enable TCP/IP in SQL Server Configuration');
    console.error('   5. Check firewall settings');
    console.error('');
    console.error('📚 See SQL_SERVER_SETUP.md for detailed instructions');
  } finally {
    await sequelize.close();
  }
}

testConnection();

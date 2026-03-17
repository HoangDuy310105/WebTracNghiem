// =====================================================
// SEEDER - TẠO DỮ LIỆU MẪU CHO HỆ THỐNG
// =====================================================
// Chạy: node backend/seeders/seed.js

process.chdir(require('path').join(__dirname, '../..'));
require('dotenv').config();

const { sequelize, User, Exam, Question, ExamRoom } = require('../models');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Kết nối DB thành công');

    // Sync tables
    await sequelize.sync({ force: false });

    // ===== 1. USERS =====
    const existing = await User.findOne({ where: { email: 'admin@exampro.vn' } });
    if (existing) {
      console.log('⚠️  Dữ liệu mẫu đã tồn tại. Bỏ qua seed.');
      await sequelize.close();
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const adminPass   = await bcrypt.hash('Admin@123', salt);
    const teacherPass = await bcrypt.hash('Teacher@123', salt);
    const studentPass = await bcrypt.hash('Student@123', salt);

    const admin = await User.create({ fullName: 'Quản trị viên', email: 'admin@exampro.vn',   password: adminPass,   role: 'admin' });
    const teacher = await User.create({ fullName: 'Nguyễn Văn A',  email: 'teacher@exampro.vn', password: teacherPass, role: 'teacher' });
    const student = await User.create({ fullName: 'Trần Thị B',    email: 'student@exampro.vn', password: studentPass, role: 'student' });
    console.log('✅ Tạo 3 users (admin, teacher, student)');

    // ===== 2. EXAM =====
    const exam = await Exam.create({
      title: 'Kiểm tra Tin học đại cương',
      description: 'Đề thi mẫu gồm 10 câu hỏi cơ bản',
      duration: 30,
      teacherId: teacher.id,
      totalQuestions: 10
    });

    const questions = [
      { question: 'HTML là viết tắt của gì?',           optionA: 'Hyper Trainer Marking Language', optionB: 'Hyper Text Markup Language', optionC: 'Hyper Text Marketing Language', optionD: 'Hyper Tool Multi Language', correctAnswer: 'B', order: 1 },
      { question: 'CSS dùng để làm gì?',                optionA: 'Xử lý logic',                   optionB: 'Thiết kế giao diện',         optionC: 'Quản lý database',              optionD: 'Tạo API',                  correctAnswer: 'B', order: 2 },
      { question: '1 byte = ? bit',                     optionA: '4',                             optionB: '8',                          optionC: '16',                            optionD: '32',                       correctAnswer: 'B', order: 3 },
      { question: 'IP là viết tắt của gì?',             optionA: 'Internet Program',              optionB: 'Internal Protocol',          optionC: 'Internet Protocol',             optionD: 'Internal Program',         correctAnswer: 'C', order: 4 },
      { question: 'HTTP mặc định dùng cổng nào?',       optionA: '21',                            optionB: '22',                         optionC: '80',                            optionD: '443',                      correctAnswer: 'C', order: 5 },
      { question: 'JavaScript là ngôn ngữ gì?',         optionA: 'Biên dịch',                     optionB: 'Thông dịch',                 optionC: 'Hợp ngữ',                       optionD: 'Máy',                      correctAnswer: 'B', order: 6 },
      { question: 'SQL là viết tắt của gì?',            optionA: 'Simple Query Language',        optionB: 'Standard Query Language',    optionC: 'Structured Query Language',     optionD: 'Strong Query Language',    correctAnswer: 'C', order: 7 },
      { question: 'RAM là bộ nhớ gì?',                  optionA: 'Chỉ đọc',                       optionB: 'Chỉ ghi',                    optionC: 'Truy cập ngẫu nhiên',           optionD: 'Lưu trữ vĩnh viễn',        correctAnswer: 'C', order: 8 },
      { question: 'CPU viết tắt của gì?',               optionA: 'Central Process Unit',          optionB: 'Central Processing Unit',    optionC: 'Core Processing Unit',          optionD: 'Central Program Unit',     correctAnswer: 'B', order: 9 },
      { question: 'Thủ đô Việt Nam là gì?',             optionA: 'TP.HCM',                        optionB: 'Đà Nẵng',                    optionC: 'Hà Nội',                        optionD: 'Huế',                      correctAnswer: 'C', order: 10 },
    ].map(q => ({ ...q, examId: exam.id }));

    await Question.bulkCreate(questions);
    console.log('✅ Tạo đề thi mẫu với 10 câu hỏi');

    // ===== 3. EXAM ROOM =====
    const now = new Date();
    const end = new Date(now.getTime() + 2 * 60 * 60 * 1000); // +2 giờ
    await ExamRoom.create({
      examId: exam.id,
      roomCode: 'DEMO01',
      startTime: now,
      endTime: end,
      maxParticipants: 50,
      createdBy: teacher.id,
      status: 'active'
    });
    console.log('✅ Tạo phòng thi mẫu: DEMO01 (active, hết hạn sau 2 giờ)');

    console.log('\n🎉 Seed hoàn tất!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:   admin@exampro.vn   / Admin@123');
    console.log('Teacher: teacher@exampro.vn / Teacher@123');
    console.log('Student: student@exampro.vn / Student@123');
    console.log('Phòng thi mẫu: DEMO01');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    await sequelize.close();
  } catch (e) {
    console.error('❌ Seed lỗi:', e.message);
    console.error(e.sql || '');
    process.exit(1);
  }
}

seed();

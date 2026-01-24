# 🎓 HỆ THỐNG THI TRẮC NGHIỆM TRỰC TUYẾN

## 📋 THÔNG TIN DỰ ÁN

**Công nghệ sử dụng:**
- Backend: Node.js + Express.js + SQL Server + Sequelize ORM
- Frontend: HTML5 + CSS3 + JavaScript + Bootstrap 5
- Realtime: Socket.io
- Authentication: JWT
- Cache: Node-Cache

---

## 👥 PHÂN CHIA CÔNG VIỆC CHO 3 NGƯỜI

### 📌 NGƯỜI 1: MODULE HỌC SINH (STUDENT)
**Branch**: `feature/student-module`

**Chức năng cần làm (4 chức năng):**
1. ✅ Đăng ký/Đăng nhập học sinh
2. ✅ Tham gia thi (nhập mã phòng)
3. ✅ Làm bài thi (chọn đáp án, đếm ngược thời gian, nộp bài)
4. ✅ Xem kết quả (điểm số, đáp án đúng/sai)

**Files cần code:**
```
Backend:
- backend/controllers/authController.js (phần student register/login)
- backend/controllers/roomController.js (phần joinRoom)
- backend/controllers/resultController.js (submit, getMyResults, getResultDetail)
- backend/routes/results.js

Frontend:
- frontend/pages/student-dashboard.html (đã có giao diện)
- frontend/js/student.js (code logic)
- frontend/pages/exam-taking.html (trang làm bài)
```

**Timeline:**
- Ngày 1: Setup database + Auth API (register/login)
- Ngày 2: Join room API + Frontend integration
- Ngày 3: Exam taking page + Timer + Submit
- Ngày 4: Results page + Testing
- Ngày 5: Bug fixes + Push code

---

### 📌 NGƯỜI 2: MODULE GIÁO VIÊN (TEACHER)
**Branch**: `feature/teacher-module`

**Chức năng cần làm (4 chức năng):**
1. ✅ Đăng ký/Đăng nhập giáo viên
2. ✅ Tạo đề thi (thêm câu hỏi + 4 đáp án + đáp án đúng)
3. ✅ Tạo phòng thi (chọn đề, thời gian, tạo mã code)
4. ✅ Xem danh sách kết quả học sinh

**Files cần code:**
```
Backend:
- backend/controllers/authController.js (phần teacher register/login)
- backend/controllers/examController.js (create, get, update, delete exam)
- backend/controllers/roomController.js (create, get rooms, get results)
- backend/routes/exams.js
- backend/routes/rooms.js

Frontend:
- frontend/pages/teacher-dashboard.html (đã có giao diện)
- frontend/js/teacher.js (code logic)
- frontend/pages/create-exam.html (form tạo đề)
- frontend/pages/create-room.html (form tạo phòng)
```

**Timeline:**
- Ngày 1: Setup database + Auth API (register/login)
- Ngày 2: Create exam API + Frontend form
- Ngày 3: Create room API + Generate room code
- Ngày 4: View results page + Export功能
- Ngày 5: Bug fixes + Push code

---

### 📌 NGƯỜI 3: MODULE ADMIN + SETUP (ADMIN)
**Branch**: `feature/admin-module`

**Chức năng cần làm (3 chức năng + Setup):**
1. ✅ Quản lý người dùng (thêm/xóa/sửa/kích hoạt)
2. ✅ Quản lý đề thi (xem/xóa)
3. ✅ Thống kê tổng quan (dashboard)
4. ✅ Setup server + database + deploy

**Files cần code:**
```
Backend:
- backend/server.js (main server file)
- backend/config/database.js (đã có)
- backend/models/*.js (đã có)
- backend/controllers/adminController.js
- backend/routes/admin.js
- backend/middleware/auth.js (đã có)
- .env

Frontend:
- frontend/pages/admin/dashboard.html (đã có giao diện)
- frontend/js/admin.js (code logic)
- frontend/js/auth.js (authentication shared)
```

**Timeline:**
- Ngày 1: Setup server.js + Database connection + Models sync
- Ngày 2: User management API + Frontend
- Ngày 3: Exam management API + Frontend
- Ngày 4: Statistics dashboard + Charts
- Ngày 5: Testing + Deployment + Documentation

---

## 🚀 HƯỚNG DẪN BẮT ĐẦU

### 1. Clone Repository
```bash
git clone <repository-url>
cd WebTracNghiem
```

### 2. Cài đặt Dependencies
```bash
npm install
```

### 3. Tạo file .env
```bash
cp .env.example .env
```
Chỉnh sửa file `.env` với thông tin SQL Server của bạn:
```
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=1433
DB_NAME=WebTracNghiem
DB_USER=sa
DB_PASSWORD=YourPassword123

JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d

CACHE_TTL=3600
```

### 4. Tạo Database trong SQL Server
```sql
CREATE DATABASE WebTracNghiem;
```

### 5. Chạy Server
```bash
npm run dev
```

---

## 📝 QUY TRÌNH LÀM VIỆC VỚI GIT

### Bước 1: Tạo branch riêng
```bash
# Người 1
git checkout -b feature/student-module

# Người 2
git checkout -b feature/teacher-module

# Người 3
git checkout -b feature/admin-module
```

### Bước 2: Làm việc trên branch của mình
```bash
# Code xong 1 chức năng thì commit
git add .
git commit -m "feat: Add student login functionality"
```

### Bước 3: Push code lên GitHub
```bash
# Người 1
git push origin feature/student-module

# Người 2
git push origin feature/teacher-module

# Người 3
git push origin feature/admin-module
```

### Bước 4: Merge vào main (sau khi hoàn thành)
```bash
git checkout main
git pull origin main
git merge feature/your-module
git push origin main
```

---

## 📂 CẤU TRÚC PROJECT

```
WebTracNghiem/
├── backend/
│   ├── config/
│   │   └── database.js          # Cấu hình SQL Server
│   ├── models/
│   │   ├── User.js              # Model người dùng
│   │   ├── Exam.js              # Model đề thi
│   │   ├── Question.js          # Model câu hỏi
│   │   ├── ExamRoom.js          # Model phòng thi
│   │   ├── Result.js            # Model kết quả
│   │   └── index.js             # Export models
│   ├── controllers/
│   │   ├── authController.js    # NGƯỜI 1 & 2
│   │   ├── examController.js    # NGƯỜI 2
│   │   ├── roomController.js    # NGƯỜI 1 & 2
│   │   ├── resultController.js  # NGƯỜI 1
│   │   └── adminController.js   # NGƯỜI 3
│   ├── routes/
│   │   ├── auth.js             # NGƯỜI 1 & 2
│   │   ├── exams.js            # NGƯỜI 2
│   │   ├── rooms.js            # NGƯỜI 1 & 2
│   │   ├── results.js          # NGƯỜI 1
│   │   └── admin.js            # NGƯỜI 3
│   ├── middleware/
│   │   └── auth.js             # Middleware xác thực
│   └── server.js               # NGƯỜI 3 (Main server)
├── frontend/
│   ├── css/
│   │   └── style.css           # CSS chung (đã xong)
│   ├── js/
│   │   ├── auth.js             # NGƯỜI 3 (Shared)
│   │   ├── student.js          # NGƯỜI 1
│   │   ├── teacher.js          # NGƯỜI 2
│   │   └── admin.js            # NGƯỜI 3
│   ├── pages/
│   │   ├── login.html          # (Đã xong)
│   │   ├── register.html       # (Đã xong)
│   │   ├── student-dashboard.html  # NGƯỜI 1
│   │   ├── teacher-dashboard.html  # NGƯỜI 2
│   │   └── admin/
│   │       └── dashboard.html  # NGƯỜI 3
│   ├── assets/                 # Hình ảnh, icons
│   └── index.html              # Trang chủ (đã xong)
├── .env                        # Cấu hình môi trường
├── .gitignore
├── package.json
└── README.md
```

---

## 🎯 CHECKLIST HOÀN THÀNH

### NGƯỜI 1 (Student Module)
- [ ] Auth API (register/login)
- [ ] Join room API
- [ ] Exam taking page với timer
- [ ] Submit exam API
- [ ] View results page
- [ ] Testing & push code

### NGƯỜI 2 (Teacher Module)
- [ ] Auth API (register/login)
- [ ] Create exam API
- [ ] Create exam frontend form
- [ ] Create room API
- [ ] View results page
- [ ] Testing & push code

### NGƯỜI 3 (Admin Module)
- [ ] Server.js setup
- [ ] Database connection
- [ ] User management API & UI
- [ ] Exam management API & UI
- [ ] Statistics dashboard
- [ ] Testing & documentation

---

## 📞 HỖ TRỢ

**Gặp lỗi?** Liên hệ nhóm qua:
- GitHub Issues
- Group chat

**Tài liệu tham khảo:**
- Express.js: https://expressjs.com/
- Sequelize: https://sequelize.org/
- Bootstrap 5: https://getbootstrap.com/
- Socket.io: https://socket.io/

---

## 📄 LICENSE

Copyright © 2026 - Team WebTracNghiem

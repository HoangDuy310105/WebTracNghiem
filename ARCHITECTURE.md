# 🏗️ CẤU TRÚC PROJECT - WEBTRACNGHIEM

## 📁 CẤU TRÚC THƯ MỤC HOÀN CHỈNH

```
WebTracNghiem/
│
├── 📁 backend/                  # Backend Node.js + Express
│   │
│   ├── 📁 config/              # Cấu hình
│   │   └── database.js         # Kết nối SQL Server (Sequelize)
│   │
│   ├── 📁 controllers/         # Business Logic Controllers
│   │   ├── authController.js   # Xử lý đăng ký/đăng nhập
│   │   ├── examController.js   # Quản lý đề thi
│   │   ├── roomController.js   # Quản lý phòng thi
│   │   ├── resultController.js # Xử lý kết quả
│   │   └── adminController.js  # Quản trị hệ thống
│   │
│   ├── 📁 middleware/          # Middleware Layer
│   │   ├── auth.js             # JWT authentication & authorization
│   │   ├── errorHandler.js     # Global error handling
│   │   └── validate.js         # Request validation
│   │
│   ├── 📁 models/              # Database Models (Sequelize ORM)
│   │   ├── User.js             # Model người dùng
│   │   ├── Exam.js             # Model đề thi
│   │   ├── Question.js         # Model câu hỏi
│   │   ├── ExamRoom.js         # Model phòng thi
│   │   ├── Result.js           # Model kết quả
│   │   └── index.js            # Export tất cả models + associations
│   │
│   ├── 📁 routes/              # API Routes
│   │   ├── auth.js             # /api/auth (register, login)
│   │   ├── exams.js            # /api/exams (CRUD đề thi)
│   │   ├── rooms.js            # /api/rooms (CRUD phòng thi)
│   │   ├── results.js          # /api/results (submit, view)
│   │   └── admin.js            # /api/admin (quản trị)
│   │
│   ├── 📁 validators/          # Request Validators
│   │   ├── authValidator.js    # Validate đăng ký/đăng nhập
│   │   ├── examValidator.js    # Validate tạo đề thi
│   │   ├── roomValidator.js    # Validate tạo phòng
│   │   └── resultValidator.js  # Validate nộp bài
│   │
│   ├── 📁 utils/               # Utility Functions
│   │   ├── constants.js        # Hằng số (roles, status, messages)
│   │   ├── helpers.js          # Helper functions (hash, generateCode...)
│   │   └── logger.js           # Logging system
│   │
│   ├── 📁 seeders/             # Database Seeders (data mẫu)
│   │   └── (chưa có)
│   │
│   └── server.js               # Main Server File
│
├── 📁 frontend/                # Frontend HTML/CSS/JS
│   │
│   ├── 📁 css/
│   │   ├── style.css           # CSS cho trang chủ
│   │   └── dark-theme.css      # Dark theme toàn app
│   │
│   ├── 📁 js/
│   │   ├── auth.js             # Logic đăng ký/đăng nhập
│   │   ├── student.js          # Logic dashboard học sinh
│   │   ├── teacher.js          # Logic dashboard giáo viên
│   │   ├── admin.js            # Logic dashboard admin
│   │   └── hero-animation.js   # Animations trang chủ
│   │
│   ├── 📁 pages/
│   │   ├── admin/
│   │   │   └── dashboard.html  # Dashboard admin
│   │   ├── login.html
│   │   ├── register.html
│   │   ├── student-dashboard.html
│   │   ├── teacher-dashboard.html
│   │   └── exam-taking.html
│   │
│   ├── 📁 assets/              # Hình ảnh, icons
│   │
│   └── index.html              # Trang chủ
│
├── 📁 tests/                   # Unit & Integration Tests
│   └── (chưa có)
│
├── 📁 logs/                    # Application Logs
│   └── .gitkeep
│
├── 📁 uploads/                 # File uploads (Excel import...)
│   └── .gitkeep
│
├── 📁 node_modules/            # Dependencies (được ignore)
│
├── 📄 .env                     # Environment Variables (được ignore)
├── 📄 .env.example             # Template env file
├── 📄 .gitignore               # Git ignore rules
├── 📄 package.json             # NPM dependencies
├── 📄 package-lock.json        # NPM lock file
│
└── 📁 Documentation/
    ├── README.md               # Hướng dẫn tổng quan
    ├── START_HERE.md           # Bắt đầu nhanh
    ├── QUICKSTART.md           # Chạy project
    ├── SQL_SERVER_SETUP.md     # Setup SQL Server
    ├── GIT_WORKFLOW.md         # Git workflow cho team
    ├── TEAM_TASKS.md           # Phân công công việc
    └── ARCHITECTURE.md         # File này
```

---

## 🎯 KIẾN TRÚC TỔNG QUAN

### **1. MVC Pattern (Model-View-Controller)**

```
┌─────────────┐
│   CLIENT    │  (Frontend - HTML/CSS/JS)
│  (Browser)  │
└──────┬──────┘
       │ HTTP Request
       ▼
┌─────────────────────────────────┐
│      EXPRESS SERVER             │
│  (Backend - Node.js/Express)    │
│                                 │
│  ┌──────────────────────────┐  │
│  │    ROUTES Layer          │  │ ← Định nghĩa endpoints
│  │  /api/auth               │  │
│  │  /api/exams              │  │
│  │  /api/rooms              │  │
│  └──────────┬───────────────┘  │
│             │                   │
│  ┌──────────▼───────────────┐  │
│  │   MIDDLEWARE Layer       │  │ ← Auth, Validate, Error
│  │  - authenticate()        │  │
│  │  - authorize()           │  │
│  │  - validate()            │  │
│  └──────────┬───────────────┘  │
│             │                   │
│  ┌──────────▼───────────────┐  │
│  │   CONTROLLERS Layer      │  │ ← Business Logic
│  │  - authController        │  │
│  │  - examController        │  │
│  │  - roomController        │  │
│  └──────────┬───────────────┘  │
│             │                   │
│  ┌──────────▼───────────────┐  │
│  │     MODELS Layer         │  │ ← Database Operations
│  │  (Sequelize ORM)         │  │
│  │  - User Model            │  │
│  │  - Exam Model            │  │
│  │  - Room Model            │  │
│  └──────────┬───────────────┘  │
└─────────────┼───────────────────┘
              │
              ▼
      ┌──────────────┐
      │  SQL SERVER  │  (Database)
      │   Database   │
      └──────────────┘
```

---

## 🔗 QUAN HỆ GIỮA CÁC MODELS (DATABASE ERD)

```
┌─────────────┐
│    USER     │
│─────────────│
│ id (PK)     │──┐
│ fullName    │  │
│ email       │  │ 1:N (Teacher tạo nhiều Exam)
│ password    │  │
│ role        │  │
└─────────────┘  │
       │         │
       │         ▼
       │    ┌─────────────┐
       │    │    EXAM     │──┐
       │    │─────────────│  │
       │    │ id (PK)     │  │
       │    │ title       │  │ 1:N (Exam có nhiều Question)
       │    │ teacherId(FK)  │
       │    │ duration    │  │
       │    └─────────────┘  │
       │         │           │
       │         │           ▼
       │         │      ┌──────────────┐
       │         │      │   QUESTION   │
       │         │      │──────────────│
       │         │      │ id (PK)      │
       │         │      │ examId (FK)  │
       │         │      │ question     │
       │         │      │ optionA...D  │
       │         │      │ correctAnswer│
       │         │      └──────────────┘
       │         │
       │         ▼
       │    ┌─────────────┐
       │    │  EXAM_ROOM  │
       │    │─────────────│
       │    │ id (PK)     │
       │    │ roomCode    │
       │    │ examId (FK) │
       │    │ teacherId(FK)
       │    │ startTime   │
       │    │ endTime     │
       │    └─────────────┘
       │         │
       │         │ 1:N (Room có nhiều Result)
       │         │
       ▼         ▼
  ┌─────────────────┐
  │     RESULT      │
  │─────────────────│
  │ id (PK)         │
  │ studentId (FK)  │ → USER
  │ roomId (FK)     │ → EXAM_ROOM
  │ examId (FK)     │ → EXAM
  │ answers (JSON)  │
  │ score           │
  └─────────────────┘
```

---

## 🔌 API ENDPOINTS

### **Authentication (/api/auth)**
- `POST /register` - Đăng ký tài khoản
- `POST /login` - Đăng nhập

### **Exams (/api/exams)**
- `GET /` - Lấy danh sách đề thi
- `GET /:id` - Lấy chi tiết đề thi
- `POST /` - Tạo đề thi mới [Teacher]
- `PUT /:id` - Cập nhật đề thi [Teacher]
- `DELETE /:id` - Xóa đề thi [Teacher]

### **Rooms (/api/rooms)**
- `POST /` - Tạo phòng thi [Teacher]
- `POST /join` - Tham gia phòng thi [Student]
- `GET /` - Lấy danh sách phòng [Teacher]
- `GET /:id/results` - Xem kết quả phòng [Teacher]

### **Results (/api/results)**
- `POST /submit` - Nộp bài thi [Student]
- `GET /my-results` - Xem kết quả của tôi [Student]
- `GET /:id` - Xem chi tiết kết quả

### **Admin (/api/admin)**
- `GET /users` - Quản lý users
- `GET /stats` - Thống kê hệ thống
- `DELETE /users/:id` - Xóa user

---

## 🛠️ CÔNG NGHỆ SỬ DỤNG

### **Backend:**
- **Node.js** - Runtime
- **Express.js** - Web framework
- **Sequelize** - ORM cho SQL Server
- **JWT** - Authentication
- **bcryptjs** - Hash password
- **Socket.io** - Realtime communication
- **express-validator** - Validation
- **node-cache** - Caching

### **Frontend:**
- **HTML5/CSS3** - Markup & Styling
- **JavaScript (ES6+)** - Logic
- **Bootstrap 5** - UI Framework
- **Font Awesome** - Icons

### **Database:**
- **SQL Server** - Relational database

---

## 📦 DEPENDENCIES

Xem file `package.json` để biết chi tiết các dependencies.

---

## 🚀 LUỒNG XỬ LÝ REQUEST

### **Ví dụ: Student nộp bài thi**

```
1. Frontend gửi POST /api/results/submit
   ├─ Headers: Authorization: Bearer <token>
   └─ Body: { roomId, answers: [...] }

2. Express Router (/api/results) nhận request
   └─ Chuyển đến submitExam handler

3. Middleware Pipeline:
   ├─ authenticate() → Verify JWT token
   ├─ submitExamValidator → Validate request data
   └─ validate() → Check validation errors

4. Controller (resultController.submitExam):
   ├─ Tìm ExamRoom theo roomId
   ├─ Kiểm tra thời gian thi còn hợp lệ
   ├─ Lấy danh sách câu hỏi từ Exam
   ├─ So sánh answers với correctAnswer
   ├─ Tính điểm (calculateScore helper)
   ├─ Lưu Result vào database
   └─ Emit Socket.io event (student submitted)

5. Response trả về Frontend:
   └─ { success: true, data: { score, correctAnswers } }

6. Frontend hiển thị kết quả cho student
```

---

## 📝 QUY TẮC CODE

### **Naming Conventions:**
- **Files:** camelCase (`authController.js`)
- **Models:** PascalCase (`User`, `ExamRoom`)
- **Functions:** camelCase (`getUserById`)
- **Constants:** UPPER_SNAKE_CASE (`HTTP_STATUS`)
- **Database fields:** snake_case (`created_at`)

### **Code Style:**
- Sử dụng `async/await` thay vì callbacks
- Handle errors với try-catch
- Validate đầu vào với express-validator
- Comment code bằng Tiếng Việt
- Luôn return response format chuẩn: `{ success, message, data }`

---

## ✅ CHECKLIST KHI THÊM FEATURE MỚI

- [ ] Tạo Model nếu cần (trong `models/`)
- [ ] Tạo Validator (trong `validators/`)
- [ ] Tạo Controller (trong `controllers/`)
- [ ] Tạo Route (trong `routes/`)
- [ ] Update `server.js` để register route
- [ ] Tạo Frontend UI
- [ ] Tạo Frontend JS logic
- [ ] Test API với Postman
- [ ] Test giao diện trên browser
- [ ] Commit code với message rõ ràng

---

**📅 Cập nhật lần cuối:** March 14, 2026
**👥 Team:** WebTracNghiem Development Team

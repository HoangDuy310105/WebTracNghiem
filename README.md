# ExamPro — Hệ thống thi trắc nghiệm trực tuyến

> Full-stack web app: Node.js + Express + Sequelize + MS SQL Server + Socket.io

---

## 🗂️ Cấu trúc thư mục

```
WebTracNghiem/
├── backend/
│   ├── config/          # Cấu hình database, swagger
│   ├── controllers/     # Xử lý logic (OOP class-based)
│   ├── middleware/       # Auth JWT, validate, errorHandler
│   ├── models/          # Sequelize ORM models
│   ├── routes/          # Express router
│   ├── seeders/         # Dữ liệu mẫu
│   ├── utils/           # constants, helpers, logger
│   ├── validators/      # express-validator schemas
│   └── server.js        # Entry point
├── frontend/
│   ├── assets/          # Images, icons
│   ├── css/             # Stylesheets
│   ├── js/              # Client-side JS (auth, student, teacher, admin)
│   └── pages/           # HTML pages
├── logs/                # Log files (auto-generated)
├── uploads/             # File uploads
├── tests/               # Unit & integration tests
├── .env                 # Environment variables (không commit)
├── .env.example         # Template biến môi trường
└── package.json
```

---

## ⚙️ Cài đặt & Chạy

### 1. Yêu cầu hệ thống
- Node.js >= 18
- SQL Server 2019+ (hoặc SQL Server Express)

### 2. Cài dependencies
```bash
npm install
```

### 3. Cấu hình môi trường
```bash
copy .env.example .env
# Chỉnh sửa .env với thông tin SQL Server của bạn
```

### 4. Tạo database
```sql
-- Chạy trong SQL Server Management Studio
-- Nội dung file: backend/init-db.sql
```

### 5. Seed dữ liệu mẫu (tuỳ chọn)
```bash
node backend/seeders/seed.js
```

### 6. Chạy server
```bash
npm start          # Production
npm run dev        # Development (nodemon)
```

Truy cập: **http://localhost:5000**

---

## 👤 Tài khoản mặc định (sau khi seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@exampro.vn | Admin@123 |
| Giáo viên | teacher@exampro.vn | Teacher@123 |
| Học sinh | student@exampro.vn | Student@123 |

---

## 🔌 API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/register` | Đăng ký |
| GET | `/api/exams` | Danh sách đề thi |
| POST | `/api/exams` | Tạo đề thi |
| GET | `/api/rooms` | Danh sách phòng thi |
| POST | `/api/rooms` | Tạo phòng thi |
| POST | `/api/rooms/join` | Tham gia phòng thi |
| POST | `/api/results/submit` | Nộp bài |
| GET | `/api/results/my-results` | Kết quả của tôi |

Swagger UI: **http://localhost:5000/api-docs**

---

## 🔧 Tech Stack

- **Backend:** Node.js, Express 4, Sequelize 6, Socket.io 4
- **Database:** Microsoft SQL Server (tedious driver)
- **Auth:** JWT (jsonwebtoken), bcryptjs
- **Frontend:** HTML5, CSS3, Bootstrap 5, Vanilla JS
- **Real-time:** Socket.io
- **Validation:** express-validator
- **Docs:** Swagger / OpenAPI

---

## 📡 Socket.io Events

| Event | Hướng | Mô tả |
|-------|-------|-------|
| `student-join-room` | Client → Server | Học sinh vào phòng thi |
| `teacher-monitor` | Client → Server | GV bắt đầu giám sát phòng |
| `room-state` | Server → Client | Cập nhật trạng thái phòng live |
| `progress-update` | Client → Server | Học sinh gửi tiến độ làm bài |
| `force-submit-room` | Client → Server | GV kết thúc tất cả bài thi |
| `force-submit` | Server → Client | Lệnh nộp bài tới học sinh |
| `student-submitted` | Client → Server | Học sinh đã nộp bài |

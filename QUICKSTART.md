# 🚀 HƯỚNG DẪN CHẠY PROJECT NHANH

## ✅ BƯỚC 1: CÀI ĐẶT

### 1.1. Cài đặt Node.js
- Download: https://nodejs.org/
- Chọn phiên bản LTS (Long Term Support)
- Cài đặt và restart máy

### 1.2. Cài đặt SQL Server
- Download SQL Server Express (miễn phí): https://www.microsoft.com/sql-server/sql-server-downloads
- Hoặc sử dụng SQL Server đã có sẵn

### 1.3. Clone/Download Project
```bash
# Nếu có Git
git clone <repository-url>

# Hoặc download ZIP và giải nén
```

## ✅ BƯỚC 2: CÀI ĐẶT DEPENDENCIES

```bash
cd WebTracNghiem
npm install
```

Chờ npm cài đặt tất cả packages (khoảng 2-3 phút)

## ✅ BƯỚC 3: CẤU HÌNH DATABASE

### 3.1. Tạo Database trong SQL Server

**Cách 1: Dùng SQL Server Management Studio (SSMS)**
1. Mở SSMS
2. Connect to Server
3. Right-click "Databases" → "New Database"
4. Tên database: `WebTracNghiem`
5. Click OK

**Cách 2: Dùng Command**
```sql
CREATE DATABASE WebTracNghiem;
```

### 3.2. Tạo file .env

Copy file `.env.example` thành `.env`:
```bash
copy .env.example .env
```

Hoặc tạo file `.env` mới với nội dung:
```
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=1433
DB_NAME=WebTracNghiem
DB_USER=sa
DB_PASSWORD=YourPassword123

JWT_SECRET=my_secret_key_123
JWT_EXPIRE=7d

CACHE_TTL=3600
```

**⚠️ Quan trọng:** Thay đổi `DB_PASSWORD` bằng mật khẩu SQL Server của bạn!

## ✅ BƯỚC 4: CHẠY SERVER

```bash
npm run dev
```

Nếu thành công, bạn sẽ thấy:
```
🚀 ====================================
✅ Server running on port 5000
📁 Frontend: http://localhost:5000
🔌 Socket.io: http://localhost:5000
💾 Database: WebTracNghiem
🌍 Environment: development
🚀 ====================================
```

## ✅ BƯỚC 5: MỞ TRÌNH DUYỆT

Mở trình duyệt và truy cập:
```
http://localhost:5000
```

Bạn sẽ thấy trang chủ với giao diện đẹp!

## 🎯 KIỂM TRA HOẠT ĐỘNG

### Test 1: Health Check API
```
http://localhost:5000/api/health
```

Nếu thấy:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "..."
}
```
→ **Server hoạt động OK!**

### Test 2: Giao diện Frontend
- Trang chủ: http://localhost:5000
- Đăng nhập: http://localhost:5000/pages/login.html
- Đăng ký: http://localhost:5000/pages/register.html

## 🐛 XỬ LÝ LỖI THƯỜNG GẶP

### Lỗi 1: Cannot find module 'express'
```bash
npm install
```

### Lỗi 2: Database connection failed
- Kiểm tra SQL Server đã chạy chưa
- Kiểm tra thông tin trong file `.env`
- Kiểm tra password SQL Server

### Lỗi 3: Port 5000 đã được sử dụng
Đổi port trong file `.env`:
```
PORT=3000
```

### Lỗi 4: ECONNREFUSED khi connect database
- Bật SQL Server Browser service
- Enable TCP/IP trong SQL Server Configuration Manager
- Kiểm tra firewall

## 📝 LƯU Ý QUAN TRỌNG

1. **CHƯA CÓ API BACKEND** - Hiện tại chỉ có:
   - ✅ Giao diện frontend hoàn chỉnh
   - ✅ Server.js cơ bản
   - ✅ Database models
   - ❌ Controllers chưa code (TODO cho 3 người)

2. **PHÂN CÔNG:**
   - NGƯỜI 1: Code backend cho Student module
   - NGƯỜI 2: Code backend cho Teacher module
   - NGƯỜI 3: Code backend cho Admin module

3. **KIỂM TRA TRƯỚC KHI CODE:**
   - [ ] Server chạy được
   - [ ] Mở được trang chủ
   - [ ] Database connect thành công
   - [ ] Đọc kỹ README.md
   - [ ] Đọc kỹ GIT_WORKFLOW.md

## 🔥 BẮT ĐẦU CODE

### NGƯỜI 1 (Student):
```bash
git checkout -b feature/student-module
# Bắt đầu code trong:
# - backend/controllers/resultController.js
# - frontend/js/student.js
```

### NGƯỜI 2 (Teacher):
```bash
git checkout -b feature/teacher-module
# Bắt đầu code trong:
# - backend/controllers/examController.js
# - backend/controllers/roomController.js
# - frontend/js/teacher.js
```

### NGƯỜI 3 (Admin):
```bash
git checkout -b feature/admin-module
# Bắt đầu code trong:
# - backend/controllers/adminController.js
# - backend/controllers/authController.js
# - frontend/js/admin.js
```

## 📞 CẦN TRỢ GIÚP?

1. Đọc file `README.md` - Hướng dẫn chi tiết
2. Đọc file `GIT_WORKFLOW.md` - Cách dùng Git
3. Xem comments trong code - Có gợi ý TODO
4. Hỏi nhóm qua chat

---

**Chúc các bạn code thành công! 🎉**

# 🚀 HƯỚNG DẪN NHANH CHO TEAM

## 📥 BƯỚC 1: CLONE PROJECT VỀ MÁY

```bash
# Clone repo
git clone https://github.com/TÊN_CỦA_BẠN/WebTracNghiem.git

# Vào thư mục
cd WebTracNghiem

# Cài đặt packages
npm install
```

## 🔧 BƯỚC 2: CÀI ĐẶT SQL SERVER

1. Cài SQL Server Express (xem file `SQL_SERVER_SETUP.md`)
2. Tạo database tên: `WebTracNghiem`
3. Copy file `.env.example` thành `.env`
4. Sửa password trong `.env`:
   ```
   DB_PASSWORD=password_cua_ban
   ```
5. Test kết nối:
   ```bash
   node test-connection.js
   ```

## 🌿 BƯỚC 3: CHECKOUT NHÁNH CỦA BẠN

```bash
# Người 1 - Module Học Sinh
git checkout feature/student-module

# Người 2 - Module Giáo Viên
git checkout feature/teacher-module

# Người 3 - Module Admin + Auth
git checkout feature/admin-module
```

## 💻 BƯỚC 4: BẮT ĐẦU CODE

### **Người 1 - Module Học Sinh**
Code trong:
- `backend/controllers/resultController.js`
- `frontend/js/student.js`

Xem chi tiết: `TEAM_TASKS.md` → Phần "Người 1"

### **Người 2 - Module Giáo Viên**
Code trong:
- `backend/controllers/examController.js`
- `backend/controllers/roomController.js`
- `frontend/js/teacher.js`

Xem chi tiết: `TEAM_TASKS.md` → Phần "Người 2"

### **Người 3 - Module Admin**
Code trong:
- `backend/controllers/adminController.js`
- `backend/controllers/authController.js`
- `frontend/js/admin.js`
- `frontend/js/auth.js`
- **QUAN TRỌNG:** Uncomment routes trong `backend/server.js`

Xem chi tiết: `TEAM_TASKS.md` → Phần "Người 3"

## 📤 BƯỚC 5: COMMIT & PUSH MỖI NGÀY

```bash
# Sáng: Pull code mới
git pull origin feature/YOUR-BRANCH

# Code...

# Tối: Commit & push
git add .
git commit -m "✨ Mô tả công việc vừa làm"
git push origin feature/YOUR-BRANCH
```

## ✅ BƯỚC 6: TẠO PULL REQUEST KHI XONG

1. Vào GitHub
2. Tab "Pull requests" → "New pull request"
3. Base: `main` ← Compare: `feature/YOUR-BRANCH`
4. Viết mô tả đầy đủ
5. Click "Create pull request"
6. Thông báo cho trưởng nhóm

## 🆘 GẶP VẤN ĐỀ?

- Đọc file: `QUICKSTART.md`
- Đọc file: `TEAM_TASKS.md`
- Hỏi trong group chat
- Xem video demo (nếu có)# 📋 TÓM TẮT DỰ ÁN - CHIA VIỆC CHO 3 NGƯỜI

## 🎯 TÌNH TRẠNG HIỆN TẠI

### ✅ ĐÃ HOÀN THÀNH (100% GIAO DIỆN)

1. **Frontend hoàn chỉnh với giao diện đẹp:**
   - ✅ Trang chủ (index.html) - responsive, hiệu ứng đẹp
   - ✅ Trang đăng nhập/đăng ký
   - ✅ Dashboard Học sinh (student-dashboard.html)
   - ✅ Dashboard Giáo viên (teacher-dashboard.html)
   - ✅ Dashboard Admin (admin/dashboard.html)
   - ✅ CSS đầy đủ (style.css) - animations, hover effects
   - ✅ Bootstrap 5 + Font Awesome icons

2. **Backend structure cơ bản:**
   - ✅ Server.js với Express + Socket.io
   - ✅ Database config cho SQL Server
   - ✅ Project structure hoàn chỉnh
   - ✅ package.json với tất cả dependencies

3. **Documentation đầy đủ:**
   - ✅ README.md - Hướng dẫn chi tiết
   - ✅ GIT_WORKFLOW.md - Cách dùng Git cho nhóm
   - ✅ QUICKSTART.md - Hướng dẫn chạy nhanh
   - ✅ .env.example - Template cấu hình

### ❌ CẦN CODE (Backend Logic)

**Phần code backend được chia đều cho 3 người**, mỗi người chịu trách nhiệm 1 module:

---

## 👥 PHÂN CÔNG CHI TIẾT

### 📌 NGƯỜI 1: MODULE HỌC SINH (Student Module)

**Branch:** `feature/student-module`

**Files cần code:**

1. **Backend Controllers:**
   ```
   backend/controllers/authController.js
   └─ Chỉ phần: register() và login() cho student
   
   backend/controllers/roomController.js  
   └─ Chỉ phần: joinRoom()
   
   backend/controllers/resultController.js
   └─ submitExam()
   └─ getMyResults()
   └─ getResultDetail()
   
   backend/routes/results.js
   └─ Setup routes cho results
   ```

2. **Frontend Logic:**
   ```
   frontend/js/student.js
   └─ loadDashboard()
   └─ handleJoinExam()
   └─ startExam()
   └─ startTimer() - Countdown timer
   └─ submitExam()
   └─ loadMyResults()
   
   Tạo thêm: frontend/pages/exam-taking.html
   └─ Trang làm bài thi với timer
   └─ Display câu hỏi
   └─ Select đáp án
   └─ Submit button
   ```

**Timeline:**
- **Day 1:** Auth API (student register/login)
- **Day 2:** Join room API + Frontend
- **Day 3:** Exam taking page + Timer
- **Day 4:** Submit + Results view
- **Day 5:** Testing + Push code

**Checklist:**
- [ ] Student có thể đăng ký/đăng nhập
- [ ] Student nhập mã phòng và vào thi
- [ ] Hiển thị đề thi với timer đếm ngược
- [ ] Chọn đáp án và nộp bài
- [ ] Xem điểm và đáp án đúng/sai

---

### 📌 NGƯỜI 2: MODULE GIÁO VIÊN (Teacher Module)

**Branch:** `feature/teacher-module`

**Files cần code:**

1. **Backend Controllers:**
   ```
   backend/controllers/authController.js
   └─ Chỉ phần: register() và login() cho teacher
   
   backend/controllers/examController.js
   └─ createExam()
   └─ getExams()
   └─ getExamById()
   └─ updateExam()
   └─ deleteExam()
   
   backend/controllers/roomController.js
   └─ createRoom()
   └─ getRooms()
   └─ getRoomResults()
   └─ updateRoomStatus()
   
   backend/routes/exams.js
   backend/routes/rooms.js
   └─ Setup routes
   ```

2. **Frontend Logic:**
   ```
   frontend/js/teacher.js
   └─ loadDashboard()
   └─ showCreateExamForm()
   └─ addQuestion()
   └─ removeQuestion()
   └─ submitExam()
   └─ loadMyExams()
   └─ showCreateRoomForm()
   └─ generateRoomCode()
   └─ submitRoom()
   └─ loadMyRooms()
   └─ viewRoomResults()
   
   Tạo thêm:
   frontend/pages/create-exam.html (Form tạo đề)
   frontend/pages/create-room.html (Form tạo phòng)
   ```

**Timeline:**
- **Day 1:** Auth API (teacher register/login)
- **Day 2:** Create exam API + Frontend form
- **Day 3:** Create room API + Generate code
- **Day 4:** View results + Export
- **Day 5:** Testing + Push code

**Checklist:**
- [ ] Teacher có thể đăng ký/đăng nhập
- [ ] Tạo đề thi với nhiều câu hỏi
- [ ] Tạo phòng thi với mã code
- [ ] Xem danh sách học sinh đã làm bài
- [ ] Xem điểm số của từng học sinh

---

### 📌 NGƯỜI 3: MODULE ADMIN + SETUP (Admin Module)

**Branch:** `feature/admin-module`

**Files cần code:**

1. **Backend Controllers:**
   ```
   backend/controllers/adminController.js
   └─ getAllUsers()
   └─ updateUserStatus()
   └─ deleteUser()
   └─ getAllExams()
   └─ deleteExam()
   └─ getStats()
   
   backend/routes/admin.js
   └─ Setup routes
   
   Hoàn thiện:
   backend/server.js
   └─ Uncomment routes
   └─ Test all endpoints
   ```

2. **Models (cần tạo đầy đủ):**
   ```
   backend/models/User.js ✅ (đã có structure)
   backend/models/Exam.js ✅
   backend/models/Question.js ✅
   backend/models/ExamRoom.js ✅
   backend/models/Result.js ✅
   backend/models/index.js ✅
   
   → Cần test và sync với database
   ```

3. **Middleware:**
   ```
   backend/middleware/auth.js ✅ (đã có)
   → Test JWT authentication
   ```

4. **Frontend Logic:**
   ```
   frontend/js/admin.js
   └─ loadDashboard()
   └─ loadUsers()
   └─ deleteUser()
   └─ toggleUserStatus()
   └─ loadExams()
   └─ deleteExam()
   └─ loadStats()
   
   frontend/js/auth.js
   └─ Đã có cơ bản, cần test
   ```

**Timeline:**
- **Day 1:** Setup server + Database sync + Test models
- **Day 2:** User management API + UI
- **Day 3:** Exam management API + UI
- **Day 4:** Statistics dashboard
- **Day 5:** Final testing + Documentation

**Checklist:**
- [ ] Server chạy được, connect DB thành công
- [ ] Admin có thể xem tất cả users
- [ ] Khóa/Mở khóa/Xóa user
- [ ] Xem tất cả đề thi, xóa đề thi
- [ ] Dashboard thống kê: users, exams, results

---

## 🔄 QUY TRÌNH LÀM VIỆC

### 1. Setup ban đầu (Cả 3 người)
```bash
git clone <repository>
cd WebTracNghiem
npm install
cp .env.example .env
# Chỉnh sửa .env với thông tin SQL Server
npm run dev
```

### 2. Tạo branch riêng
```bash
# Người 1
git checkout -b feature/student-module

# Người 2
git checkout -b feature/teacher-module

# Người 3
git checkout -b feature/admin-module
```

### 3. Code hàng ngày
```bash
# Sáng: Pull code mới
git checkout main
git pull origin main
git checkout feature/your-module
git merge main

# Code...

# Tối: Commit & push
git add .
git commit -m "feat: Add login functionality"
git push origin feature/your-module
```

### 4. Merge sau khi xong (Ngày 5)
```bash
git checkout main
git merge feature/your-module
git push origin main
```

---

## 📝 LƯU Ý QUAN TRỌNG

### ⚠️ Để tránh conflict:

1. **Mỗi người code riêng module của mình**
   - Người 1: KHÔNG động vào exam/room code
   - Người 2: KHÔNG động vào result code
   - Người 3: KHÔNG động vào student/teacher specific code

2. **File dùng chung:**
   - `server.js` - Người 3 chịu trách nhiệm
   - `auth.js` (middleware) - Người 3 setup, 1&2 dùng
   - `authController.js` - Chia rõ phần student/teacher

3. **Commit thường xuyên:**
   - Mỗi ngày ít nhất 2-3 commits
   - Viết message rõ ràng
   - Push lên GitHub mỗi tối

4. **Testing:**
   - Test API bằng Postman/Thunder Client
   - Test giao diện trên trình duyệt
   - Báo nhóm nếu có bug

---

## 🚀 CÁCH BẮT ĐẦU

### Bước 1: Đọc tài liệu
- [ ] README.md
- [ ] GIT_WORKFLOW.md
- [ ] QUICKSTART.md
- [ ] File này (TEAM_TASKS.md)

### Bước 2: Setup môi trường
- [ ] Install Node.js
- [ ] Install SQL Server
- [ ] Clone project
- [ ] npm install
- [ ] Tạo .env
- [ ] Chạy npm run dev thành công

### Bước 3: Tạo branch và bắt đầu code
```bash
git checkout -b feature/your-module
# Code your module
git commit -m "feat: ..."
git push origin feature/your-module
```

---

## 📞 HỖ TRỢ

**Gặp vấn đề?**
1. Xem lại documentation
2. Xem comments trong code (có TODO)
3. Hỏi nhóm
4. Google/Stack Overflow

**Cần review code?**
- Push lên GitHub
- Tạo Pull Request
- Tag người khác review

---

## 🎯 KẾT QUẢ MONG ĐỢI

Sau 5 ngày, project phải có:

✅ **Frontend:** Giao diện đẹp, responsive (ĐÃ XONG)
✅ **Backend:** RESTful API đầy đủ 11 chức năng
✅ **Database:** SQL Server với đầy đủ tables
✅ **Authentication:** JWT working cho 3 roles
✅ **Realtime:** Socket.io cho exam rooms
✅ **Git:** History rõ ràng, mỗi người có commits
✅ **Documentation:** README đầy đủ

---

**Chúc team code hiệu quả! Mỗi người đóng góp bình đẳng! 🚀**

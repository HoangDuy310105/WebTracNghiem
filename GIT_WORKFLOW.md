# 📊 HƯỚNG DẪN SỬ DỤNG GIT & JIRA

## 🔄 WORKFLOW GIT CHO 3 NGƯỜI

### 📌 Setup Ban Đầu (Chỉ làm 1 lần)

**Bước 1: Initialize Git Repository**
```bash
cd WebTracNghiem
git init
git add .
git commit -m "Initial commit: Project setup with frontend templates"
```

**Bước 2: Tạo Repository trên GitHub**
1. Vào GitHub → New Repository
2. Tên repo: `WebTracNghiem`
3. Description: "Hệ thống thi trắc nghiệm trực tuyến"
4. Public hoặc Private
5. **KHÔNG** tích "Initialize with README"

**Bước 3: Kết nối với GitHub**
```bash
git remote add origin https://github.com/your-username/WebTracNghiem.git
git branch -M main
git push -u origin main
```

---

## 👥 PHÂN CHIA BRANCH CHO TỪNG NGƯỜI

### NGƯỜI 1: Student Module
```bash
git checkout -b feature/student-module
```

### NGƯỜI 2: Teacher Module
```bash
git checkout -b feature/teacher-module
```

### NGƯỜI 3: Admin Module
```bash
git checkout -b feature/admin-module
```

---

## 💻 QUY TRÌNH LÀM VIỆC HÀNG NGÀY

### Mỗi sáng (Sync code mới nhất)
```bash
git checkout main
git pull origin main
git checkout feature/your-module
git merge main
```

### Trong khi code (Commit thường xuyên)
```bash
# Sau khi code xong 1 chức năng nhỏ
git add .
git commit -m "feat: Add login form validation"

# Push lên GitHub
git push origin feature/your-module
```

### Mỗi tối (Push code của ngày)
```bash
git add .
git commit -m "feat: Complete student dashboard UI"
git push origin feature/your-module
```

---

## 📝 QUY TẮC VIẾT COMMIT MESSAGE

Sử dụng format:
```
<type>: <description>

Types:
- feat:     Thêm chức năng mới
- fix:      Sửa lỗi
- docs:     Cập nhật document
- style:    Thay đổi CSS, format code
- refactor: Refactor code
- test:     Thêm test
```

**Ví dụ:**
```bash
git commit -m "feat: Add student login API"
git commit -m "fix: Fix timer countdown bug"
git commit -m "docs: Update README with API endpoints"
git commit -m "style: Improve dashboard UI responsiveness"
```

---

## 🔀 MERGE CODE VÀO MAIN

### Cách 1: Merge trực tiếp (Nhanh)
```bash
# Chuyển về main
git checkout main
git pull origin main

# Merge branch của bạn
git merge feature/your-module

# Push lên GitHub
git push origin main
```

### Cách 2: Pull Request (Khuyến nghị - để review code)
1. Push branch lên GitHub:
   ```bash
   git push origin feature/your-module
   ```
2. Vào GitHub → Tab "Pull requests" → "New pull request"
3. Base: `main` ← Compare: `feature/your-module`
4. Điền title & description
5. Assign reviewer (thành viên khác)
6. Create pull request
7. Sau khi được approve → Merge pull request

---

## 🎯 TIMELINE GIT CHO TỪNG NGƯỜI

### NGƯỜI 1 (Student Module)
```
Day 1: Setup + Auth
  git commit -m "feat: Add student auth backend"
  git push origin feature/student-module

Day 2: Join Room
  git commit -m "feat: Add join room functionality"
  git push origin feature/student-module

Day 3: Exam Taking
  git commit -m "feat: Add exam taking page with timer"
  git push origin feature/student-module

Day 4: Results
  git commit -m "feat: Add results viewing page"
  git push origin feature/student-module

Day 5: Merge to main
  git checkout main
  git merge feature/student-module
  git push origin main
```

### NGƯỜI 2 (Teacher Module)
```
Day 1: Setup + Auth
  git commit -m "feat: Add teacher auth backend"
  git push origin feature/teacher-module

Day 2: Create Exam
  git commit -m "feat: Add create exam functionality"
  git push origin feature/teacher-module

Day 3: Create Room
  git commit -m "feat: Add create room functionality"
  git push origin feature/teacher-module

Day 4: View Results
  git commit -m "feat: Add teacher results dashboard"
  git push origin feature/teacher-module

Day 5: Merge to main
  git checkout main
  git merge feature/teacher-module
  git push origin main
```

### NGƯỜI 3 (Admin Module)
```
Day 1: Server Setup
  git commit -m "feat: Setup Express server and database"
  git push origin feature/admin-module

Day 2: User Management
  git commit -m "feat: Add user management for admin"
  git push origin feature/admin-module

Day 3: Exam Management
  git commit -m "feat: Add exam management for admin"
  git push origin feature/admin-module

Day 4: Statistics
  git commit -m "feat: Add statistics dashboard"
  git push origin feature/admin-module

Day 5: Merge to main
  git checkout main
  git merge feature/admin-module
  git push origin main
```

---

## 🐛 XỬ LÝ CONFLICT

Khi merge bị conflict:
```bash
# Bước 1: Xem file bị conflict
git status

# Bước 2: Mở file và sửa
# Tìm các dòng:
<<<<<<< HEAD
Your code
=======
Their code
>>>>>>> feature/branch

# Chọn giữ code nào hoặc merge cả 2

# Bước 3: Commit
git add .
git commit -m "fix: Resolve merge conflict"
```

---

## 📊 TÍCH HỢP JIRA (Optional)

### Setup Jira cho Project

1. **Tạo Project trên Jira**
   - Tên: "Web Trac Nghiem"
   - Template: Scrum

2. **Tạo Epics (3 modules)**
   - Epic 1: Student Module
   - Epic 2: Teacher Module
   - Epic 3: Admin Module

3. **Tạo Tasks cho mỗi người**

**NGƯỜI 1 (Student):**
- WTN-1: Student Authentication
- WTN-2: Join Exam Room
- WTN-3: Take Exam with Timer
- WTN-4: View Results

**NGƯỜI 2 (Teacher):**
- WTN-5: Teacher Authentication
- WTN-6: Create Exam
- WTN-7: Create Exam Room
- WTN-8: View Student Results

**NGƯỜI 3 (Admin):**
- WTN-9: Server Setup
- WTN-10: User Management
- WTN-11: Exam Management
- WTN-12: Statistics Dashboard

4. **Liên kết Jira với Git**
```bash
# Include Jira ticket trong commit message
git commit -m "WTN-1: feat: Add student login API"
git commit -m "WTN-5: feat: Add teacher registration"
```

---

## 📈 THEO DÕI TIẾN ĐỘ

### Trên GitHub
- Vào tab "Insights" → "Network" để xem branch graph
- Tab "Commits" để xem lịch sử commit của cả team

### Commands hữu ích
```bash
# Xem history
git log --oneline --graph --all

# Xem ai commit gì
git log --author="Nguyen Van A"

# Xem thay đổi của file
git diff filename.js

# Xem branches
git branch -a
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

1. **KHÔNG commit file .env** (đã có trong .gitignore)
2. **KHÔNG push node_modules** (đã có trong .gitignore)
3. **Commit thường xuyên** - mỗi ngày ít nhất 2-3 commits
4. **Viết commit message rõ ràng** - người khác đọc hiểu được
5. **Pull code mỗi sáng** - tránh conflict lớn
6. **Test code trước khi push** - đảm bảo không lỗi
7. **Review code của nhau** - học hỏi lẫn nhau

---

## 🎓 TÀI LIỆU THAM KHẢO

- Git Basics: https://git-scm.com/book/en/v2
- GitHub Guides: https://guides.github.com/
- Jira Tutorial: https://www.atlassian.com/software/jira/guides

---

**Chúc team làm việc hiệu quả! 🚀**

# 💾 HƯỚNG DẪN CÀI ĐẶT VÀ CẤU HÌNH SQL SERVER

## 📥 BƯỚC 1: DOWNLOAD SQL SERVER

### Option 1: SQL Server Express (Miễn phí, Khuyến nghị)
1. Truy cập: https://www.microsoft.com/en-us/sql-server/sql-server-downloads
2. Chọn **"Download now"** ở phần **Express**
3. File download: SQLServer2022-SSEI-Expr.exe (khoảng 6MB)

### Option 2: SQL Server Developer (Miễn phí, Đầy đủ tính năng)
1. Cùng link trên
2. Chọn **Developer**

---

## 🔧 BƯỚC 2: CÀI ĐẶT SQL SERVER

### 2.1. Chạy file installer
1. Double-click file vừa download
2. Chọn **"Basic"** installation type
3. Chọn thư mục cài đặt (mặc định là OK)
4. Click **"Install"**
5. Đợi 5-10 phút

### 2.2. Ghi nhớ thông tin
Sau khi cài xong, màn hình sẽ hiển thị:
- **Server name:** `localhost` hoặc `YOUR-PC-NAME`
- **Instance:** `SQLEXPRESS`
- **Connection string:** `localhost\SQLEXPRESS` hoặc `(localdb)\MSSQLLocalDB`

---

## 🛠️ BƯỚC 3: CÀI ĐẶT SQL SERVER MANAGEMENT STUDIO (SSMS)

### 3.1. Download SSMS
1. Trong installer window, click **"Install SSMS"**
2. Hoặc truy cập: https://aka.ms/ssmsfullsetup
3. Download file (khoảng 600MB)

### 3.2. Cài đặt SSMS
1. Chạy file installer
2. Click **"Install"**
3. Đợi 10-15 phút
4. Restart máy (nếu yêu cầu)

---

## 🔐 BƯỚC 4: CẤU HÌNH SQL AUTHENTICATION

### 4.1. Mở SSMS
1. Start Menu → Tìm "SQL Server Management Studio"
2. Mở app

### 4.2. Connect to Server
```
Server type: Database Engine
Server name: localhost\SQLEXPRESS
          (hoặc localhost)
Authentication: Windows Authentication
```
Click **"Connect"**

### 4.3. Enable SQL Server Authentication

1. Right-click server name → **"Properties"**
2. Chọn **"Security"** (bên trái)
3. Trong **"Server authentication"**, chọn:
   - ✅ **SQL Server and Windows Authentication mode**
4. Click **"OK"**
5. **Restart SQL Server service**

### 4.4. Restart SQL Server
**Cách 1: Trong SSMS**
- Right-click server → **"Restart"**

**Cách 2: Trong Services**
- Start Menu → Tìm "services.msc"
- Tìm **"SQL Server (SQLEXPRESS)"**
- Right-click → **"Restart"**

---

## 👤 BƯỚC 5: TẠO USER VÀ PASSWORD

### 5.1. Sử dụng user 'sa' (System Administrator)

1. Trong SSMS, expand **"Security"** → **"Logins"**
2. Right-click **"sa"** → **"Properties"**
3. Chọn tab **"General"**:
   - Đặt password mới (ví dụ: `YourPassword123`)
   - ✅ Tích **"Enforce password policy"** → Bỏ tích (để dễ)
4. Chọn tab **"Status"**:
   - Login: **Enabled**
5. Click **"OK"**

### 5.2. Hoặc tạo user mới (khuyến nghị)

```sql
-- Chạy query này trong SSMS
CREATE LOGIN webtracnghiem WITH PASSWORD = 'YourPassword123';
GO

CREATE USER webtracnghiem FOR LOGIN webtracnghiem;
GO

ALTER SERVER ROLE sysadmin ADD MEMBER webtracnghiem;
GO
```

---

## 📊 BƯỚC 6: TẠO DATABASE

### Cách 1: Dùng GUI
1. Trong SSMS, right-click **"Databases"**
2. Chọn **"New Database..."**
3. Database name: `WebTracNghiem`
4. Click **"OK"**

### Cách 2: Dùng Query
```sql
CREATE DATABASE WebTracNghiem;
GO

USE WebTracNghiem;
GO
```

---

## ⚙️ BƯỚC 7: ENABLE TCP/IP

### 7.1. Mở SQL Server Configuration Manager
1. Start Menu → Tìm "SQL Server Configuration Manager"
2. Hoặc: Run → `SQLServerManager16.msc` (phiên bản 2022)

### 7.2. Enable TCP/IP
1. Expand **"SQL Server Network Configuration"**
2. Click **"Protocols for SQLEXPRESS"**
3. Right-click **"TCP/IP"** → **"Enable"**
4. Right-click **"TCP/IP"** → **"Properties"**
5. Tab **"IP Addresses"**:
   - Tìm **"IPAll"**
   - **TCP Port:** `1433`
6. Click **"OK"**
7. **Restart SQL Server service**

---

## 🧪 BƯỚC 8: TEST CONNECTION

### 8.1. Test trong SSMS
1. File → **"New Query"**
2. Chạy query:
```sql
SELECT @@VERSION;
SELECT DB_NAME();
```

### 8.2. Test từ Node.js

Tạo file `test-connection.js`:
```javascript
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('WebTracNghiem', 'sa', 'YourPassword123', {
  host: 'localhost',
  port: 1433,
  dialect: 'mssql',
  dialectOptions: {
    options: {
      encrypt: true,
      trustServerCertificate: true
    }
  }
});

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connection successful!');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    await sequelize.close();
  }
}

testConnection();
```

Chạy:
```bash
node test-connection.js
```

---

## 🔧 BƯỚC 9: CẬP NHẬT FILE .ENV

```env
PORT=5000
NODE_ENV=development

# Nếu dùng SQL Server Express với Windows Auth
DB_HOST=localhost
DB_PORT=1433
DB_NAME=WebTracNghiem
DB_USER=sa
DB_PASSWORD=YourPassword123

# Hoặc nếu tạo user mới
DB_HOST=localhost
DB_PORT=1433
DB_NAME=WebTracNghiem
DB_USER=webtracnghiem
DB_PASSWORD=YourPassword123

JWT_SECRET=my_secret_key_123
JWT_EXPIRE=7d

CACHE_TTL=3600
```

---

## 🐛 XỬ LÝ LỖI

### Lỗi 1: Cannot connect to server
**Giải pháp:**
- Kiểm tra SQL Server service đã chạy chưa (services.msc)
- Restart service
- Kiểm tra firewall

### Lỗi 2: Login failed for user 'sa'
**Giải pháp:**
- Enable SQL Server Authentication (Bước 4)
- Reset password cho 'sa' (Bước 5)
- Restart SQL Server

### Lỗi 3: Port 1433 closed
**Giải pháp:**
- Enable TCP/IP (Bước 7)
- Check port trong SQL Configuration Manager
- Restart service

### Lỗi 4: Database does not exist
**Giải pháp:**
- Tạo database `WebTracNghiem` (Bước 6)
- Kiểm tra tên database trong .env

### Lỗi 5: Connection timeout
**Giải pháp:**
```javascript
// Trong database.js, tăng timeout
pool: {
  max: 5,
  min: 0,
  acquire: 60000, // Tăng từ 30000 lên 60000
  idle: 10000
}
```

---

## ✅ CHECKLIST HOÀN TẤT

- [ ] SQL Server Express đã cài đặt
- [ ] SSMS đã cài đặt và mở được
- [ ] SQL Server Authentication đã bật
- [ ] User 'sa' đã có password
- [ ] Database 'WebTracNghiem' đã tạo
- [ ] TCP/IP đã enable
- [ ] Port 1433 đã mở
- [ ] Test connection thành công
- [ ] File .env đã cập nhật đúng
- [ ] `npm run dev` chạy được

---

## 📚 TÀI LIỆU THAM KHẢO

- SQL Server Docs: https://docs.microsoft.com/en-us/sql/
- Sequelize with MSSQL: https://sequelize.org/docs/v6/other-topics/dialect-specific-things/#mssql
- Node.js SQL Server: https://www.npmjs.com/package/tedious

---

**Setup xong rồi thì bắt đầu code thôi! 🚀**

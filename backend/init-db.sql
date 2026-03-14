-- =====================================================
-- KHỞI TẠO DATABASE CHO HỆ THỐNG THI TRẮC NGHIỆM
-- =====================================================

-- Tạo database nếu chưa tồn tại
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'WebTracNghiem')
BEGIN
    CREATE DATABASE WebTracNghiem;
    PRINT '✅ Database "WebTracNghiem" đã được tạo thành công!';
END
ELSE
BEGIN
    PRINT '⚠️ Database "WebTracNghiem" đã tồn tại.';
END
GO

-- Chọn database
USE WebTracNghiem;
GO

PRINT '';
PRINT '🎯 ====================================';
PRINT '✅ Khởi tạo database thành công!';
PRINT '🎯 ====================================';
PRINT '';
PRINT '📌 Các bước tiếp theo:';
PRINT '   1. Quay lại VS Code';
PRINT '   2. Chạy: npm start';
PRINT '   3. Sequelize sẽ tự động tạo tables';
PRINT '';
GO

-- =====================================================
-- Script: Migration từ Tours_Promotion sang Tours.PromotionID
-- Mục đích: Đơn giản hóa mối quan hệ Tour-Promotion
-- Từ: Many-to-Many (Tours_Promotion table)
-- Sang: One-to-Many (Tours.PromotionID column)
-- Ngày: 19/10/2025
-- =====================================================

USE TourismManagementSystem;
GO

PRINT '========================================';
PRINT 'BẮT ĐẦU MIGRATION';
PRINT '========================================';
GO

-- BƯỚC 1: Thêm cột PromotionID vào bảng Tours
IF NOT EXISTS (SELECT * FROM sys.columns 
               WHERE object_id = OBJECT_ID('dbo.Tours') 
               AND name = 'PromotionID')
BEGIN
    PRINT 'BƯỚC 1: Thêm cột PromotionID vào Tours...';
    
    ALTER TABLE dbo.Tours
    ADD PromotionID INT NULL;
    
    PRINT '✅ Đã thêm cột Tours.PromotionID';
END
ELSE
BEGIN
    PRINT '⚠️ Cột PromotionID đã tồn tại trong Tours';
END
GO

-- BƯỚC 2: Di chuyển dữ liệu từ Tours_Promotion sang Tours.PromotionID
IF EXISTS (SELECT * FROM sys.objects WHERE name = 'Tours_Promotion' AND type = 'U')
BEGIN
    PRINT 'BƯỚC 2: Di chuyển dữ liệu từ Tours_Promotion...';
    
    -- Nếu 1 tour có nhiều promotion, chỉ giữ lại promotion có ID lớn nhất (mới nhất)
    UPDATE T
    SET T.PromotionID = TP.PromotionID
    FROM dbo.Tours T
    INNER JOIN (
        SELECT TourID, MAX(PromotionID) AS PromotionID
        FROM dbo.Tours_Promotion
        GROUP BY TourID
    ) TP ON T.TourID = TP.TourID;
    
    DECLARE @MigratedCount INT = @@ROWCOUNT;
    PRINT '✅ Đã di chuyển ' + CAST(@MigratedCount AS VARCHAR) + ' dòng dữ liệu';
END
ELSE
BEGIN
    PRINT '⚠️ Bảng Tours_Promotion không tồn tại';
END
GO

-- BƯỚC 3: Xóa bảng Tours_Promotion cũ
IF EXISTS (SELECT * FROM sys.objects WHERE name = 'Tours_Promotion' AND type = 'U')
BEGIN
    PRINT 'BƯỚC 3: Xóa bảng Tours_Promotion...';
    
    DROP TABLE dbo.Tours_Promotion;
    
    PRINT '✅ Đã xóa bảng Tours_Promotion';
END
GO

-- BƯỚC 4: Thêm Foreign Key Constraint
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Tours_Promotion')
BEGIN
    PRINT 'BƯỚC 4: Thêm Foreign Key constraint...';
    
    ALTER TABLE dbo.Tours
    ADD CONSTRAINT FK_Tours_Promotion 
        FOREIGN KEY (PromotionID) 
        REFERENCES dbo.Promotion(PromotionID)
        ON DELETE SET NULL;  -- Xóa Promotion → Set Tours.PromotionID = NULL
    
    PRINT '✅ Đã thêm FK constraint';
END
GO

-- BƯỚC 5: Thêm Index cho performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Tours_PromotionID')
BEGIN
    PRINT 'BƯỚC 5: Thêm Index cho Tours.PromotionID...';
    
    CREATE INDEX IX_Tours_PromotionID ON dbo.Tours(PromotionID);
    
    PRINT '✅ Đã thêm Index';
END
GO

-- BƯỚC 6: Kiểm tra kết quả
PRINT '';
PRINT '========================================';
PRINT 'KIỂM TRA KẾT QUẢ MIGRATION';
PRINT '========================================';

-- Đếm số tours có promotion
SELECT 
    @TotalTours = COUNT(*),
    @ToursWithPromo = SUM(CASE WHEN PromotionID IS NOT NULL THEN 1 ELSE 0 END),
    @ToursWithoutPromo = SUM(CASE WHEN PromotionID IS NULL THEN 1 ELSE 0 END)
FROM (
    SELECT COUNT(*) AS TotalTours FROM dbo.Tours
    UNION ALL
    SELECT COUNT(*) FROM dbo.Tours WHERE PromotionID IS NOT NULL
    UNION ALL
    SELECT COUNT(*) FROM dbo.Tours WHERE PromotionID IS NULL
) AS Counts;

PRINT 'Tổng số Tours: ' + CAST((SELECT COUNT(*) FROM dbo.Tours) AS VARCHAR);
PRINT 'Tours có Promotion: ' + CAST((SELECT COUNT(*) FROM dbo.Tours WHERE PromotionID IS NOT NULL) AS VARCHAR);
PRINT 'Tours KHÔNG có Promotion: ' + CAST((SELECT COUNT(*) FROM dbo.Tours WHERE PromotionID IS NULL) AS VARCHAR);
GO

-- Hiển thị sample data
PRINT '';
PRINT 'SAMPLE DATA:';
SELECT TOP 10
    T.TourID,
    T.TourName,
    T.PromotionID,
    P.PromotionName,
    P.Percent
FROM dbo.Tours T
LEFT JOIN dbo.Promotion P ON T.PromotionID = P.PromotionID
ORDER BY T.TourID;
GO

PRINT '';
PRINT '========================================';
PRINT '✅ MIGRATION HOÀN TẤT!';
PRINT '========================================';
PRINT '';
PRINT 'TỔNG KẾT:';
PRINT '- ✅ Đã thêm cột Tours.PromotionID';
PRINT '- ✅ Đã di chuyển dữ liệu từ Tours_Promotion';
PRINT '- ✅ Đã xóa bảng Tours_Promotion';
PRINT '- ✅ Đã thêm Foreign Key constraint';
PRINT '- ✅ Đã thêm Index cho performance';
PRINT '';
PRINT 'MỐI QUAN HỆ MỚI:';
PRINT '- 1 Promotion → Nhiều Tours (One-to-Many)';
PRINT '- 1 Tour → CHỈ 1 Promotion (hoặc NULL)';
PRINT '- Tours.PromotionID là nullable Foreign Key';
PRINT '';
GO

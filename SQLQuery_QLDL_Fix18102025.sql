----------------------------------------------------------
-- 1. KHỞI TẠO DATABASE
----------------------------------------------------------
-- 1.1. Rebuild toàn bộ database (tránh lỗi khi đang có kết nối)
USE master;
GO

IF DB_ID('TourismManagementSystem') IS NOT NULL -- HeThongQuanLyDuLich cũ
BEGIN
    ALTER DATABASE TourismManagementSystem SET SINGLE_USER WITH ROLLBACK IMMEDIATE; 
    DROP DATABASE TourismManagementSystem;
END;
GO

CREATE DATABASE TourismManagementSystem;
GO

USE TourismManagementSystem;
GO

----------------------------------------------------------
-- 2. TẠO BẢNG CHÍNH
----------------------------------------------------------
-- 2.1. Bảng Roles
CREATE TABLE dbo.Roles (
    RoleID INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    RoleName NVARCHAR(50) UNIQUE NOT NULL
);
GO

 -- 2.2. Bảng Tour Types
CREATE TABLE dbo.TourTypes (
    TourTypeID INT IDENTITY(1,1) PRIMARY KEY,
    TourTypeName NVARCHAR(50)
);
GO

-- 2.3. Bảng Users
CREATE TABLE dbo.Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Fullname NVARCHAR(100) NOT NULL,
    Gender NVARCHAR(10) CHECK (Gender IN ('Female', 'Male', 'Other')),
    Email NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,  -- Mã hóa bcrypt
    PhoneNumber NVARCHAR(15),
    Age TINYINT,
    [Address] NVARCHAR(100),
    CreateDate DATETIME DEFAULT GETDATE(),
    RoleID INT NOT NULL DEFAULT 1 -- 1 là ADMIN hoặc 2 là CUSTOMER hoặc 3 là 1 role nào đó sau này muốn thêm
                CONSTRAINT FK_User_Roles REFERENCES dbo.Roles(RoleID)
);
GO

-- Index cho tìm kiếm nhanh
CREATE INDEX IX_User_Email ON dbo.[Users](Email);
CREATE INDEX IX_User_RoleID ON dbo.[Users](RoleID);
GO

-- 2.4. Bảng Promotion (Di chuyển lên TRƯỚC Tours để tránh lỗi Foreign Key)
-- 1 Promotion có thể áp dụng cho NHIỀU Tours
CREATE TABLE dbo.Promotion (
    PromotionID INT IDENTITY(1,1) PRIMARY KEY,
    PromotionName NVARCHAR(150) NOT NULL,
    [Percent] DECIMAL(5,2)  NOT NULL 
            CONSTRAINT CK_Promo_Pct CHECK ([Percent] > 0 AND [Percent] <= 100),  -- 0 - 100%
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    CONSTRAINT CK_Promo_DateRange CHECK (EndDate >= StartDate)
);
GO

-- 2.5. Bảng Tours
CREATE TABLE dbo.Tours (
    TourID INT IDENTITY(1,1) PRIMARY KEY,
    TourName NVARCHAR(50),
    [Description] NVARCHAR(MAX) NULL,
    TouristDestination NVARCHAR(120) NOT NULL, -- địa điểm sẽ đến du lịch
    TourTypesID INT NOT NULL 
                    CONSTRAINT FK_Tours_TourTypes REFERENCES dbo.TourTypes(TourTypeID),
    PromotionID INT NULL  -- 1 Tour chỉ có 1 Promotion (hoặc NULL nếu không có)
                    CONSTRAINT FK_Tours_Promotion REFERENCES dbo.Promotion(PromotionID)
                    ON DELETE SET NULL  -- Nếu xóa Promotion, set Tours.PromotionID = NULL
);
GO

-- index cho tìm kiếm nhanh
CREATE INDEX IX_Tours_TouristDestination ON dbo.Tours(TouristDestination);
CREATE INDEX IX_Tours_PromotionID ON dbo.Tours(PromotionID); -- Index cho join với Promotion
GO

-- 2.6. Bảng TourDeparture
CREATE TABLE dbo.TourDeparture ( -- lịch khởi hành của mỗi tour vì 1 tour có các ngày khởi hành khác nhau
    TourDepartureID INT IDENTITY(1,1) PRIMARY KEY,
    TourID INT NOT NULL
                    CONSTRAINT FK_Dep_Tour REFERENCES dbo.Tours(TourID),
    DayNum INT NOT NULL -- tour đi trong mấy ngày
                    CONSTRAINT CK_TourDeparture_DayNum CHECK (DayNum > 0),
    OriginalPrice DECIMAL(18,2) NOT NULL 
                                CONSTRAINT CK_Tours_OriginalPrice CHECK (OriginalPrice >= 0),
    DepartureLocation NVARCHAR(50), -- địa điểm khởi hành
    DepartureTime DATETIME NOT NULL, -- ngày khởi hành
    ReturnTime DATETIME NOT NULL, -- ngày trở về
    DateCreated DATE,
    MaxQuantity INT NOT NULL -- số lượng khách đăng kí tối đa trong 1 tour (thay đổi không nhất thiết 1 tour phải 50 slot)
                    CONSTRAINT CK_Dep_MaxQuantity CHECK (MaxQuantity > 0)
);
GO

-- index 
CREATE UNIQUE INDEX UQ_Dep_Tours_Date ON dbo.TourDeparture(TourID, DepartureTime, ReturnTime);
CREATE INDEX IX_Dep_Tours ON dbo.TourDeparture(TourID, DepartureTime);
GO

-- 2.6. Bảng Tour Guide
CREATE TABLE dbo.TourGuide (
    TourGuideID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL UNIQUE
                CONSTRAINT FK_TourGuide_Users REFERENCES dbo.[Users](UserID),
    Rating DECIMAL(3,2) NULL CONSTRAINT CK_Guide_Rating CHECK (Rating BETWEEN 0 AND 5),
    Languages NVARCHAR(200) NULL
);
GO
-- Index cho tìm kiếm nhanh
CREATE INDEX IX_TourGuide_UserID ON dbo.TourGuide(UserID);
GO


-- 2.9. Bảng  TourDeparture_TourGuide -- Phân công HDV cho từng TourDeparture
CREATE TABLE dbo.TourDeparture_TourGuide (
    TourDepartureID INT NOT NULL CONSTRAINT FK_TDTG_TourDeparture REFERENCES dbo.TourDeparture(TourDepartureID),
    TourGuideID     INT NOT NULL CONSTRAINT FK_TDTG_TourGuide REFERENCES dbo.TourGuide(TourGuideID),
    PRIMARY KEY (TourDepartureID, TourGuideID)
);
GO

-- ❌ ĐÃ XÓA: Bảng Tours_Promotion (không còn dùng)
-- ✅ THAY VÀO: Cột PromotionID trong bảng Tours
-- Mối quan hệ mới: One-to-Many (1 Promotion → Nhiều Tours)
-- 1 Tour chỉ có CHỈ 1 Promotion (hoặc NULL)

-- 2.12. Bảng Booking 
CREATE TABLE dbo.Booking (
    BookingID       INT IDENTITY(1,1) PRIMARY KEY,
    UserID          INT NOT NULL CONSTRAINT FK_Book_Users REFERENCES dbo.[Users](UserID),
    TourDepartureID INT NOT NULL CONSTRAINT FK_Book_Dep  REFERENCES dbo.TourDeparture(TourDepartureID),
    PromotionID     INT NULL     CONSTRAINT FK_Book_Promo REFERENCES dbo.Promotion(PromotionID), 
    
    Quantity        INT NOT NULL CONSTRAINT CK_Book_Qty CHECK (Quantity > 0),
    
    -- Cột lưu giá gốc tại thời điểm đặt, lấy từ TourDeparture.OriginalPrice
    OriginalPrice   DECIMAL(18,2) NOT NULL CONSTRAINT CK_Book_Price CHECK (OriginalPrice >= 0), 
    
    DiscountAmount  DECIMAL(18,2) NOT NULL DEFAULT 0 CONSTRAINT CK_Book_Discount CHECK (DiscountAmount >= 0), 
    
    -- Cột tính toán TỔNG THANH TOÁN: (Quantity * OriginalPrice) - DiscountAmount
    TotalPayment    AS ((Quantity * OriginalPrice) - DiscountAmount) PERSISTED, 
    
    PaymentStatus   NVARCHAR(20) NOT NULL DEFAULT 'PENDING'
                    CONSTRAINT CK_Book_Status CHECK (PaymentStatus IN ('PENDING','PAID','CANCELLED')),
    BookingDate     DATETIME NOT NULL DEFAULT GETDATE()
);
GO

----------------------------------------------------------
-- 3. THÊM DỮ LIỆU MẪU BẮT BUỘC
----------------------------------------------------------

-- 3.1. Bảng Roles
INSERT INTO dbo.Roles (RoleName) VALUES
('Admin'), ('Customer'), ('Tour Guide');
GO

-- 3.2. Bảng TourTypes
INSERT INTO dbo.TourTypes (TourTypeName) VALUES
(N'Nghỉ dưỡng biển'), (N'Khám phá văn hóa'), (N'Phiêu lưu, Trekking');
GO

-- 3.3. Bảng Users
DECLARE @PasswordHashSample NVARCHAR(255) = N'hashed_password_sample_12345';
INSERT INTO dbo.Users (Fullname, Gender, Email, PasswordHash, PhoneNumber, Age, [Address], RoleID) VALUES
(N'Nguyễn Văn A (Admin)', 'Male', 'admin.a@dulich.vn', @PasswordHashSample, '0901111222', 35, N'Hà Nội', 1), -- UserID = 1
(N'Trần Thị B (Customer)', 'Female', 'customer.b@mail.com', @PasswordHashSample, '0902222333', 28, N'TP. Hồ Chí Minh', 2), -- UserID = 2
(N'Lê Văn C (Customer)', 'Male', 'customer.c@mail.com', @PasswordHashSample, '0903333444', 42, N'Đà Nẵng', 2), -- UserID = 3
(N'Hướng dẫn viên 1 (Guide)', 'Female', 'guide1.c@mail.com', @PasswordHashSample, '0903333444', 42, N'Đà Nẵng', 3), -- UserID = 4
(N'Hướng dẫn viên 2 (Guide)', 'Male', 'guide2.c@mail.com', @PasswordHashSample, '0903333444', 42, N'Đà Nẵng', 3); -- UserID = 5
GO

-- 3.4 Bảng Tour Guide


-- 3.4. Bảng Promotion (Phải insert TRƯỚC Tours vì Tours có FK đến Promotion)
INSERT INTO dbo.Promotion (PromotionName, [Percent], StartDate, EndDate) VALUES
(N'Ưu đãi hè sớm 10%', 10.00, DATEADD(day, -7, GETDATE()), DATEADD(day, 30, GETDATE())), -- PromoID=1 (Active)
(N'Giảm giá chớp nhoáng 20%', 20.00, DATEADD(day, -1, GETDATE()), DATEADD(day, 3, GETDATE())), -- PromoID=2 (Active)
(N'Ưu đãi đã hết hạn', 5.00, DATEADD(month, -1, GETDATE()), DATEADD(day, -7, GETDATE())); -- PromoID=3 (Expired)
GO

-- 3.5. Bảng Tours (với PromotionID)
INSERT INTO dbo.Tours (TourName, [Description], TouristDestination, TourTypesID, PromotionID) VALUES
(N'Khám phá Vịnh Hạ Long', N'Du thuyền qua các hòn đảo đá vôi.', N'Quảng Ninh', 1, 1), -- TourID=1, có KM 10%
(N'Hành trình di sản miền Trung', N'Tham quan cố đô Huế, Hội An.', N'Huế, Đà Nẵng', 2, NULL), -- TourID=2, KHÔNG có KM
(N'Trekking đỉnh Fansipan', N'Chinh phục nóc nhà Đông Dương.', N'Lào Cai', 3, 2); -- TourID=3, có KM 20%
GO

-- 3.6. Bảng TourDeparture
DECLARE @Today DATE = CAST(GETDATE() AS DATE);
INSERT INTO dbo.TourDeparture (TourID, DayNum, OriginalPrice, DepartureLocation, DepartureTime, ReturnTime, DateCreated, MaxQuantity)
VALUES
(1, 3, 4500000.00, N'Hà Nội', DATEADD(day, 7, @Today),  DATEADD(day, 10, @Today), @Today, 30),
(1, 4, 5500000.00, N'Hà Nội', DATEADD(day, 15, @Today), DATEADD(day, 18, @Today), @Today, 30), -- đổi ngày cho khác 7,10
(2, 5, 8200000.00, N'TP. Hồ Chí Minh', DATEADD(day, 14, @Today), DATEADD(day, 19, @Today), @Today, 20),
(2, 6, 9200000.00, N'TP. Hồ Chí Minh', DATEADD(day, 21, @Today), DATEADD(day, 26, @Today), @Today, 20), -- đổi ngày
(3, 4, 3800000.00, N'Hà Nội', DATEADD(day, 25, @Today), DATEADD(day, 29, @Today), @Today, 15),
(3, 7, 4800000.00, N'Hà Nội', DATEADD(day, 30, @Today), DATEADD(day, 35, @Today), @Today, 15);
GO

-- ❌ ĐÃ XÓA: Bảng Tours_Promotion không còn tồn tại
-- ✅ Promotion giờ được lưu trực tiếp trong Tours.PromotionID

-- 3.8. Dữ liệu Booking ban đầu (Đảm bảo TotalBooked < MaxQuantity)
-- Đặt 5 chỗ cho TourDepID 3 (Fansipan, Max 15)
INSERT INTO dbo.Booking (UserID, TourDepartureID, PromotionID, Quantity, OriginalPrice, DiscountAmount, PaymentStatus, BookingDate) VALUES
(2, 3, 2, 5, 3800000.00, 3800000.00 * 5 * 0.2, 'PAID', GETDATE());
GO

----------------------------------------------------------
-- 4. STORED PROCEDURE
----------------------------------------------------------
-- 4.1 Stored Procedure thêm đăng ký booking và tính giá tour
IF OBJECT_ID('dbo.usp_AddBooking', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_AddBooking;
GO

CREATE PROCEDURE dbo.usp_AddBooking
    @p_UserID INT,
    @p_TourDepartureID INT,
    @p_PromotionCodeID INT = NULL,
    @p_Quantity INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Khai báo biến
    DECLARE @MaxQuantity INT;
    DECLARE @BookedQuantity INT;
    DECLARE @AvailableSlots INT;
    DECLARE @OriginalPrice DECIMAL(18,2);
    DECLARE @TourID INT;
    DECLARE @PromotionPercent DECIMAL(5,2) = 0;
    DECLARE @DiscountAmount DECIMAL(18,2);
    
    -- 4.1.1. Lấy thông tin cơ bản: MaxQuantity, TourID, OriginalPrice (từ TourDeparture)
    SELECT 
        @MaxQuantity = MaxQuantity,
        @TourID = TourID,
        @OriginalPrice = OriginalPrice
    FROM dbo.TourDeparture 
    WHERE TourDepartureID = @p_TourDepartureID;

    -- Kiểm tra tính hợp lệ của TourDepartureID
    IF @TourID IS NULL OR @OriginalPrice IS NULL
    BEGIN
        RAISERROR(N'ID khởi hành tour không hợp lệ hoặc thiếu giá gốc.', 16, 1);
        RETURN;
    END

    -- 4.1.2. Kiểm tra số lượng Slot
    -- Tính số lượng khách đã book (PENDING và PAID)
    SELECT @BookedQuantity = ISNULL(SUM(Quantity), 0)
    FROM dbo.Booking
    WHERE TourDepartureID = @p_TourDepartureID 
      AND PaymentStatus IN ('PENDING', 'PAID');

    SET @AvailableSlots = @MaxQuantity - @BookedQuantity;

    -- Kiểm tra logic số lượng
    IF @p_Quantity <= 0
    BEGIN
        RAISERROR(N'Số lượng khách phải lớn hơn 0.', 16, 1);
        RETURN;
    END
    IF @p_Quantity > @AvailableSlots
    BEGIN
        RAISERROR(N'Không đủ chỗ. Số chỗ còn trống là %d.', 16, 1, @AvailableSlots);
        RETURN;
    END

    -- 4.1.3. Tính toán Khuyến mãi
    IF @p_PromotionCodeID IS NOT NULL
    BEGIN
        -- Lấy % Khuyến mãi hợp lệ cho Tour và thời điểm hiện tại
        -- ✅ CẬP NHẬT: Join trực tiếp qua Tours.PromotionID (không cần Tours_Promotion)
        SELECT @PromotionPercent = P.[Percent]
        FROM dbo.Promotion P
        INNER JOIN dbo.Tours T ON P.PromotionID = T.PromotionID
        WHERE P.PromotionID = @p_PromotionCodeID
          AND T.TourID = @TourID
          AND P.StartDate <= GETDATE()
          AND P.EndDate >= GETDATE();
        
        -- Nếu KM không hợp lệ, hủy áp dụng
        IF @PromotionPercent = 0
        BEGIN
            SET @p_PromotionCodeID = NULL;
        END
    END

    -- 4.1.4. Tính toán số tiền giảm giá thực tế (DiscountAmount)
    -- Tổng giá trước giảm * % giảm
    SET @DiscountAmount = (@OriginalPrice * @p_Quantity) * (@PromotionPercent / 100.0);

    -- 4.1.5. Thực hiện Booking
    BEGIN TRANSACTION;
    
    INSERT INTO dbo.Booking (
        UserID, TourDepartureID, PromotionID, Quantity, OriginalPrice, DiscountAmount, PaymentStatus, BookingDate
    )
    VALUES (
        @p_UserID, @p_TourDepartureID, @p_PromotionCodeID, @p_Quantity, @OriginalPrice, @DiscountAmount, 'PENDING', GETDATE()
    );

    COMMIT TRANSACTION;

    SELECT SCOPE_IDENTITY() AS NewBookingID;
END
GO

----------------------------------------------------------
-- 5. TRIGGER
----------------------------------------------------------
-- 5.1. Trigger kiểm tra số lượng khách tối đa.
IF OBJECT_ID('dbo.trg_Booking_CheckCapacity', 'TR') IS NOT NULL
    DROP TRIGGER dbo.trg_Booking_CheckCapacity;
GO

CREATE TRIGGER dbo.trg_Booking_CheckCapacity
ON dbo.Booking
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Chỉ kiểm tra các bản ghi có trạng thái là PENDING hoặc PAID
    IF EXISTS (
        SELECT 1
        FROM inserted i
        WHERE i.PaymentStatus IN ('PENDING', 'PAID')
    )
    BEGIN
        DECLARE @TourDepartureID INT;
        DECLARE cur CURSOR FOR
            SELECT DISTINCT TourDepartureID FROM inserted;
        
        OPEN cur;
        FETCH NEXT FROM cur INTO @TourDepartureID;

        WHILE @@FETCH_STATUS = 0
        BEGIN
            DECLARE @MaxQuantity INT;
            DECLARE @TotalBooked INT;

            SELECT @MaxQuantity = MaxQuantity
            FROM dbo.TourDeparture
            WHERE TourDepartureID = @TourDepartureID;

            SELECT @TotalBooked = ISNULL(SUM(Quantity), 0)
            FROM dbo.Booking
            WHERE TourDepartureID = @TourDepartureID
              AND PaymentStatus IN ('PENDING', 'PAID');

            -- Kiểm tra
            IF @TotalBooked > @MaxQuantity
            BEGIN
                RAISERROR(N'Số lượng khách đặt (Tổng: %d) đã vượt quá số lượng tối đa cho phép (%d) của chuyến khởi hành ID %d.', 16, 1, @TotalBooked, @MaxQuantity, @TourDepartureID);
                ROLLBACK TRANSACTION;
                CLOSE cur;
                DEALLOCATE cur;
                RETURN;
            END
            
            FETCH NEXT FROM cur INTO @TourDepartureID;
        END

        CLOSE cur;
        DEALLOCATE cur;
    END
END
GO

----------------------------------------------------------
-- 6. TEST STORED PROCEDURE
----------------------------------------------------------
-- 6.1. TEST 1: Đặt tour Thành công (KHÔNG KM) ***
-- PRINT N'-- TEST 1: Đặt tour Thành công (KHÔNG KM) --';
-- GO -- Kết thúc batch trước

-- DECLARE @NewBookingID1 INT;
-- DECLARE @ReturnCode1 INT;

-- -- Đặt TourDepID 2 (Miền Trung, Giá 8.2tr) cho 2 người, không KM. Max 20, Booked 0.
-- -- Kết quả mong đợi: Booking mới được tạo, TotalPayment = 16,400,000.
-- EXEC @ReturnCode1 = dbo.usp_AddBooking 
--     @p_UserID = 3, 
--     @p_TourDepartureID = 2, 
--     @p_PromotionCodeID = NULL, 
--     @p_Quantity = 2;

-- -- Lấy ID booking vừa tạo (ID lớn nhất)
-- SET @NewBookingID1 = SCOPE_IDENTITY();

-- SELECT 
--     N'TEST 1 PASS (KHÔNG KM)' AS [TestResult], 
--     b.*
-- FROM dbo.Booking b
-- WHERE b.BookingID = @NewBookingID1;
-- GO

-- -- 6.2. TEST 2: Đặt tour Thành công (CÓ KM 20% HỢP LỆ) ***
-- PRINT N'-- TEST 2: Đặt tour Thành công (CÓ KM 20% HỢP LỆ) --';
-- GO -- Kết thúc batch trước

-- DECLARE @NewBookingID2 INT;
-- DECLARE @ReturnCode2 INT;

-- -- Đặt TourDepID 3 (Fansipan, Giá 3.8tr) cho 3 người. Áp dụng KM ID 2 (20% hợp lệ). Max 15, Booked 5.
-- -- TotalBeforeDiscount = 3.8tr * 3 = 11.4tr. 
-- -- DiscountAmount = 11.4tr * 20% = 2.28tr. TotalPayment = 9.12tr.
-- EXEC @ReturnCode2 = dbo.usp_AddBooking 
--     @p_UserID = 2, 
--     @p_TourDepartureID = 3, 
--     @p_PromotionCodeID = 2, 
--     @p_Quantity = 3;

-- SET @NewBookingID2 = SCOPE_IDENTITY();

-- SELECT 
--     N'TEST 2 PASS (CÓ KM 20%)' AS [TestResult], 
--     b.*
-- FROM dbo.Booking b
-- WHERE b.BookingID = @NewBookingID2;
-- GO

-- SELECT tổng tiền sau khi thêm
-- SELECT b.BookingID,
--        b.OriginalPrice,
--        b.Quantity,
--        b.DiscountAmount,
--        (b.OriginalPrice * b.Quantity - b.DiscountAmount) AS TotalAmount
-- FROM dbo.Booking b
-- WHERE b.BookingID = SCOPE_IDENTITY(); 

----------------------------------------------------------
-- 7. TEST TRIGGER
----------------------------------------------------------
-- 7.1. Kịch bản A: INSERT - Thất bại (Vượt quá MaxQuantity)
-- PRINT N'-- TEST A: INSERT - VƯỢT QUÁ SỐ LƯỢNG TỐI ĐA --';

-- -- TourDepID 3 (Fansipan) còn lại 7 chỗ (Max 15, Booked 8).
-- -- Cố gắng đặt 8 chỗ nữa (Tổng: 8 + 8 = 16 > 15). Lệnh này phải thất bại.

-- BEGIN TRY
--     INSERT INTO dbo.Booking (UserID, TourDepartureID, PromotionID, Quantity, OriginalPrice, DiscountAmount, PaymentStatus, BookingDate) 
--     VALUES (3, 3, NULL, 8, 3800000.00, 0.00, 'PENDING', GETDATE());
    
--     PRINT N'LỖI: TEST A đã chèn thành công. Trigger thất bại chặn giao dịch.';
--     -- Nếu chạy đến đây, hãy xóa bản ghi lỗi để tiếp tục:
--     DELETE FROM dbo.Booking WHERE TourDepartureID = 3 AND Quantity = 8 AND UserID = 3;
-- END TRY
-- BEGIN CATCH
--     -- Kiểm tra thông báo lỗi của Trigger (Tổng 16, Max 15)
--     IF ERROR_MESSAGE() LIKE N'%Số lượng khách đặt (Tổng: 16) đã vượt quá số lượng tối đa cho phép (15) của chuyến khởi hành ID 3.%'
--         PRINT N'TEST A PASS: Trigger đã chặn thành công việc chèn quá tải.';
--     ELSE
--         PRINT N'LỖI: TEST A bị chặn nhưng với thông báo lỗi không đúng. Lỗi: ' + ERROR_MESSAGE();
-- END CATCH

-- -- Kiểm tra xác nhận: Tổng số khách vẫn là 8.
-- SELECT 
--     N'Kiểm tra sau TEST A (Phải là 8 chỗ)' AS [Checkpoint],
--     SUM(Quantity) AS [TotalBooked]
-- FROM dbo.Booking 
-- WHERE TourDepartureID = 3 AND PaymentStatus IN ('PENDING', 'PAID');
-- GO

-- -- 7.2. Kịch bản B: UPDATE - Thất bại (Tăng Quantity quá giới hạn)
-- PRINT N'-- TEST B: UPDATE - TĂNG SỐ LƯỢNG VƯỢT QUÁ TỐI ĐA --';

-- -- TourDepID 3 (Fansipan) đang có TotalBooked = 8.
-- -- Tìm BookingID của booking 3 chỗ vừa tạo trong TEST 2:
-- DECLARE @BookingToUpdate INT = (SELECT TOP 1 BookingID FROM dbo.Booking WHERE TourDepartureID = 3 AND Quantity = 3 ORDER BY BookingID DESC);
-- DECLARE @OldQuantity INT = 3;

-- -- Cố gắng tăng Quantity từ 3 lên 10. (Tổng mới: 5 + 10 = 15). OK
-- -- Cố gắng tăng Quantity từ 3 lên 11. (Tổng mới: 5 + 11 = 16 > 15). Lệnh này phải thất bại.

-- BEGIN TRY
--     -- Cập nhật booking 3 chỗ lên 11 chỗ
--     UPDATE dbo.Booking SET Quantity = 11 WHERE BookingID = @BookingToUpdate;
    
--     PRINT N'LỖI: TEST B đã cập nhật thành công. Trigger thất bại chặn giao dịch.';
--     -- Nếu chạy đến đây, hãy khôi phục dữ liệu:
--     UPDATE dbo.Booking SET Quantity = @OldQuantity WHERE BookingID = @BookingToUpdate;
-- END TRY
-- BEGIN CATCH
--     -- Kiểm tra thông báo lỗi của Trigger (Tổng 16, Max 15)
--     IF ERROR_MESSAGE() LIKE N'%Số lượng khách đặt (Tổng: 16) đã vượt quá số lượng tối đa cho phép (15) của chuyến khởi hành ID 3.%'
--         PRINT N'TEST B PASS: Trigger đã chặn thành công việc cập nhật quá tải.';
--     ELSE
--         PRINT N'LỖI: TEST B bị chặn nhưng với thông báo lỗi không đúng. Lỗi: ' + ERROR_MESSAGE();
-- END CATCH

-- -- Kiểm tra xác nhận: Quantity của booking phải được rollback về 3.
-- SELECT 
--     N'Kiểm tra sau TEST B (Phải là 3 chỗ)' AS [Checkpoint],
--     Quantity AS [NewQuantity] 
-- FROM dbo.Booking 
-- WHERE BookingID = @BookingToUpdate;
-- GO

-- -- 7.3. Kịch bản C: UPDATE - Bỏ qua (Thay đổi sang CANCELLED)
-- PRINT N'-- TEST C: UPDATE - CHUYỂN SANG CANCELLED (BỎ QUA) --';

-- -- Lấy BookingID của booking 5 chỗ ban đầu (UserID 2)
-- DECLARE @BookingToCancel INT = (SELECT TOP 1 BookingID FROM dbo.Booking WHERE TourDepartureID = 3 AND Quantity = 5 AND PaymentStatus = 'PAID');

-- BEGIN TRY
--     -- Trigger chỉ kiểm tra PENDING/PAID, nên thao tác này phải thành công
--     UPDATE dbo.Booking SET PaymentStatus = 'CANCELLED' WHERE BookingID = @BookingToCancel;
    
--     PRINT N'TEST C PASS: Cập nhật sang CANCELLED thành công.';
-- END TRY
-- BEGIN CATCH
--     PRINT N'LỖI: TEST C thất bại, Trigger không bỏ qua trạng thái CANCELLED. Lỗi: ' + ERROR_MESSAGE();
-- END CATCH

-- -- Kiểm tra xác nhận: TotalBooked giảm từ 8 xuống 3.
-- SELECT 
--     N'Kiểm tra sau TEST C (Phải là 3 chỗ)' AS [Checkpoint],
--     SUM(Quantity) AS [TotalBooked],
--     TD.MaxQuantity - SUM(Quantity) AS [SlotsRemaining]
-- FROM dbo.TourDeparture TD
-- INNER JOIN dbo.Booking B ON TD.TourDepartureID = B.TourDepartureID
-- WHERE TD.TourDepartureID = 3 AND B.PaymentStatus IN ('PENDING', 'PAID')
-- GROUP BY TD.MaxQuantity;
-- GO

----------------------------------------------------------
-- 8. KHÁC
----------------------------------------------------------
-- 8.1. JOIN Khách theo tour & hướng dẫn viên
SELECT  t.TourID, t.TourName,
        tg.TourGuideID, ug.Fullname AS TourGuideName,
        c.UserID       AS CustomerID, c.Fullname AS CustomerName,
        b.Quantity, b.BookingDate, td.DepartureTime
FROM dbo.Booking b
JOIN dbo.Users c                      ON c.UserID = b.UserID AND c.RoleID = 2          -- khách
JOIN dbo.TourDeparture td             ON td.TourDepartureID = b.TourDepartureID
JOIN dbo.Tours t                      ON t.TourID = td.TourID
LEFT JOIN dbo.TourDeparture_TourGuide tdtg ON tdtg.TourDepartureID = td.TourDepartureID
LEFT JOIN dbo.TourGuide tg            ON tg.TourGuideID = tdtg.TourGuideID
LEFT JOIN dbo.Users ug                ON ug.UserID = tg.UserID                         -- tên HDV
ORDER BY t.TourID, TourGuideName, CustomerName;

-- 8.2. Thống kê tour phổ biến theo số booking (PENDING/PAID):
SELECT t.TourID, t.TourName,
       COUNT(*)               AS TotalBookings,
       SUM(b.Quantity)        AS TotalSeats
FROM dbo.Booking b
JOIN dbo.TourDeparture td ON td.TourDepartureID = b.TourDepartureID
JOIN dbo.Tours t          ON t.TourID = td.TourID
WHERE b.PaymentStatus IN ('PENDING','PAID')
GROUP BY t.TourID, t.TourName
ORDER BY TotalSeats DESC, TotalBookings DESC;

-- 8.3. Truy vấn danh sách tour + điểm đến + giá
-- ;WITH NextDep AS (
--   SELECT td.TourID,
--          td.TourDepartureID,
--          td.DepartureTime,
--          td.OriginalPrice,
--          ROW_NUMBER() OVER (PARTITION BY td.TourID ORDER BY td.DepartureTime) AS rn
--   FROM dbo.TourDeparture td
--   WHERE td.DepartureTime >= CAST(GETDATE() AS DATE)
-- )
-- SELECT t.TourID, t.TourName, t.TouristDestination,
--        nd.OriginalPrice AS NextPrice, nd.DepartureTime AS NextDeparture
-- FROM dbo.Tours t
-- LEFT JOIN NextDep nd ON nd.TourID = t.TourID AND nd.rn = 1
-- ORDER BY t.TourID;
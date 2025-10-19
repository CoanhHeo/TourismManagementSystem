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
    DateCreated DATETIME DEFAULT GETDATE(),
    IsActive BIT NOT NULL DEFAULT 1,  -- 1: Đang hoạt động, 0: Bị khóa
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

-- 2.6. Bảng TourGuide (Phải tạo TRƯỚC TourDeparture vì TourDeparture có FK đến TourGuide)
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

-- 2.7. Bảng TourDeparture
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
                    CONSTRAINT CK_Dep_MaxQuantity CHECK (MaxQuantity > 0),
    TourGuideID INT NULL -- Chỉ 1 tour guide cho mỗi departure (NULL nếu chưa phân công)
                    CONSTRAINT FK_Dep_TourGuide REFERENCES dbo.TourGuide(TourGuideID)
                    ON DELETE SET NULL -- Nếu xóa tour guide, set NULL thay vì xóa departure
);
GO

-- index 
CREATE UNIQUE INDEX UQ_Dep_Tours_Date ON dbo.TourDeparture(TourID, DepartureTime, ReturnTime);
CREATE INDEX IX_Dep_Tours ON dbo.TourDeparture(TourID, DepartureTime);
GO

-- 2.8. Bảng Booking 
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
(N'Nghỉ dưỡng biển'),
(N'Khám phá văn hóa'),
(N'Phiêu lưu, Trekking'),
(N'Du lịch sinh thái'),
(N'City Tour'),
(N'Tour ẩm thực'),
(N'Tour lịch sử'),
(N'Tour tâm linh');
GO

-- 3.3. Bảng Users
-- Mật khẩu mẫu cho các tài khoản test khác (không thể đăng nhập)
DECLARE @PasswordHashSample NVARCHAR(255) = N'hashed_password_sample_12345';

-- Mật khẩu mẫu cho các tài khoản test
DECLARE @AdminPasswordHash NVARCHAR(255) = N'$2a$10$3E9UyqDUk4Js0H9.XgXNaOfXW63mY7xUJDRa.P0cUOU9nbL72mHtu';

INSERT INTO dbo.Users (Fullname, Gender, Email, PasswordHash, PhoneNumber, Age, [Address], IsActive, RoleID) VALUES
-- Tài khoản Admin thật (có thể đăng nhập)
-- Email: admin@gmail.com | Password: Sanh123@
(N'Sanh Admin', 'Male', 'admin@gmail.com', @AdminPasswordHash, '0909999999', 30, N'Hà Nội', 1, 1), -- Active

-- TOUR GUIDE THẬT (có thể đăng nhập ngay)
-- Email: guide@gmail.com | Password: Sanh123@
(N'Sanh Tour Guide', 'Male', 'guide@gmail.com', @AdminPasswordHash, '0909999888', 30, N'Hà Nội', 1, 3), -- Active,

-- CUSTOMER THẬT (có thể đăng nhập ngay)
-- Email: customer@gmail.com | Password: Sanh123@
(N'Sanh Customer', 'Male', 'customer@gmail.com', @AdminPasswordHash, '0909999777', 30, N'Hà Nội', 1, 2), -- Active,

-- CÁC TÀI KHOẢN TEST (chỉ để test giao diện, không thể đăng nhập)
(N'Nguyễn Văn A', 'Male', 'admin.test@dulich.vn', @PasswordHashSample, '0901111222', 35, N'Hà Nội', 1, 1), -- UserID = 2, Active
(N'Trần Thị B', 'Female', 'customer.b@mail.com', @PasswordHashSample, '0902222333', 28, N'TP. Hồ Chí Minh', 1, 2), -- UserID = 4, Active
(N'Lê Văn C', 'Male', 'customer.c@mail.com', @PasswordHashSample, '0903333444', 42, N'Đà Nẵng', 0, 2), -- UserID = 5, LOCKED (Bị khóa)
(N'Nguyễn Thị Minh Châu', 'Female', 'guide1@gmail.com', @GuidePasswordHash, '0912345678', 28, N'Hà Nội', 1, 3), -- UserID = 6, Tour Guide 1 (CÓ THỂ ĐĂNG NHẬP Guide123@)
(N'Trần Văn Phong', 'Male', 'guide2@dulich.vn', @PasswordHashSample, '0923456789', 32, N'TP. Hồ Chí Minh', 1, 3), -- UserID = 7, Tour Guide 2
(N'Lê Thị Hương', 'Female', 'guide3@dulich.vn', @PasswordHashSample, '0934567890', 35, N'Đà Nẵng', 1, 3), -- UserID = 8, Tour Guide 3
(N'Phạm Văn Nam', 'Male', 'guide4@dulich.vn', @GuidePasswordHash, '0945678901', 30, N'Nha Trang', 1, 3), -- UserID = 9, Tour Guide 4 (CÓ THỂ ĐĂNG NHẬP)
(N'Hoàng Thị Thu', 'Female', 'guide5@dulich.vn', @PasswordHashSample, '0956789012', 27, N'Đà Lạt', 1, 3), -- UserID = 10, Tour Guide 5
(N'Ngô Văn Tú', 'Male', 'guide6@dulich.vn', @PasswordHashSample, '0967890123', 33, N'Cần Thơ', 1, 3), -- UserID = 11, Tour Guide 6
(N'Phạm Văn Đức', 'Male', 'phamvanduc@mail.com', @PasswordHashSample, '0905555111', 35, N'Hà Nội', 1, 2), -- UserID = 12, Customer
(N'Hoàng Thị Mai', 'Female', 'hoangthimai@mail.com', @PasswordHashSample, '0905555222', 29, N'TP. Hồ Chí Minh', 1, 2), -- UserID = 13, Customer
(N'Nguyễn Văn Tuấn', 'Male', 'nguyenvantuan@mail.com', @PasswordHashSample, '0905555333', 32, N'Đà Nẵng', 1, 2), -- UserID = 14, Customer
(N'Trần Thị Lan', 'Female', 'tranthilan@mail.com', @PasswordHashSample, '0905555444', 27, N'Hải Phòng', 1, 2), -- UserID = 15, Customer
(N'Lê Văn Hùng', 'Male', 'levanhung@mail.com', @PasswordHashSample, '0905555555', 40, N'Cần Thơ', 1, 2), -- UserID = 16, Customer
(N'Võ Thị Ngọc', 'Female', 'vothingoc@mail.com', @PasswordHashSample, '0905555666', 31, N'Nha Trang', 1, 2), -- UserID = 17, Customer
(N'Đặng Văn Long', 'Male', 'dangvanlong@mail.com', @PasswordHashSample, '0905555777', 38, N'Vũng Tàu', 1, 2); -- UserID = 18, Customer
GO

-- 3.4. Bảng TourGuide (Thông tin bổ sung cho hướng dẫn viên)
-- Chỉ Users có RoleID = 3 ("Tour Guide") mới có record trong bảng này
INSERT INTO dbo.TourGuide (UserID, Rating, Languages) VALUES
(2, 5.0, N'Tiếng Việt, English, 中文 (Chinese), 日本語 (Japanese)'),  -- Guide: Sanh Tour Guide (UserID=2, CÓ THỂ ĐĂNG NHẬP)
(6, 4.8, N'Tiếng Việt, English, 中文 (Chinese)'),        -- Guide 1: Nguyễn Thị Minh Châu (UserID=6)
(7, 4.5, N'Tiếng Việt, English, 日本語 (Japanese)'),     -- Guide 2: Trần Văn Phong (UserID=7)
(8, 4.2, N'Tiếng Việt, English, 한국어 (Korean)'),       -- Guide 3: Lê Thị Hương (UserID=8)
(9, 4.6, N'Tiếng Việt, English, Français (French), 日本語 (Japanese)'), -- Guide 4: Phạm Văn Nam (UserID=9, Nha Trang)
(10, 4.9, N'Tiếng Việt, English, Español (Spanish), 한국어 (Korean)'), -- Guide 5: Hoàng Thị Thu (UserID=10, Đà Lạt)
(11, 4.4, N'Tiếng Việt, English, Deutsch (German), Русский (Russian)'); -- Guide 6: Ngô Văn Tú (UserID=11, Cần Thơ)
GO

-- 3.5. Bảng Promotion (Phải insert TRƯỚC Tours vì Tours có FK đến Promotion)
INSERT INTO dbo.Promotion (PromotionName, [Percent], StartDate, EndDate) VALUES
(N'Ưu đãi hè sớm 10%', 10.00, DATEADD(day, -7, GETDATE()), DATEADD(day, 30, GETDATE())), -- PromoID=1 (Active)
(N'Giảm giá chớp nhoáng 20%', 20.00, DATEADD(day, -1, GETDATE()), DATEADD(day, 3, GETDATE())), -- PromoID=2 (Active)
(N'Ưu đãi đã hết hạn', 5.00, DATEADD(month, -1, GETDATE()), DATEADD(day, -7, GETDATE())), -- PromoID=3 (Expired)
(N'Sale cuối tuần 15%', 15.00, DATEADD(day, -3, GETDATE()), DATEADD(day, 4, GETDATE())), -- PromoID=4 (Active)
(N'Ưu đãi tháng 4 - 25%', 25.00, DATEADD(day, 5, GETDATE()), DATEADD(day, 35, GETDATE())), -- PromoID=5 (Upcoming)
(N'Khuyến mãi Black Friday 30%', 30.00, DATEADD(month, -2, GETDATE()), DATEADD(month, -1, GETDATE())); -- PromoID=6 (Expired)
GO

-- 3.6. Bảng Tours (với PromotionID)
INSERT INTO dbo.Tours (TourName, [Description], TouristDestination, TourTypesID, PromotionID) VALUES
-- Tours CỦA (TourTypesID=1: Biển - Đảo)
(N'Khám phá Vịnh Hạ Long', N'Du thuyền qua các hòn đảo đá vôi kỳ vĩ, thăm Hang Sửng Sốt, Hang Đầu Gỗ.', N'Quảng Ninh', 1, 1), -- TourID=1, KM 10%
(N'Thiên đường Phú Quốc', N'Nghỉ dưỡng biển, lặn ngắm san hô, tham quan Vinpearl Safari.', N'Kiên Giang', 1, 4), -- TourID=2, KM 15%
(N'Đảo Ngọc Nha Trang', N'Khám phá 4 đảo, tắm bùn khoáng, thưởng thức hải sản tươi sống.', N'Khánh Hòa', 1, NULL), -- TourID=3, KHÔNG KM

-- Tours CỦA (TourTypesID=2: Văn hóa - Di sản)
(N'Hành trình di sản miền Trung', N'Tham quan Đại Nội Huế, Hội An phố cổ, Thánh địa Mỹ Sơn.', N'Huế, Đà Nẵng', 2, NULL), -- TourID=4, KHÔNG KM
(N'Hà Nội - Ninh Bình cổ kính', N'Khám phá phố cổ, Tràng An, Tam Cốc - Bích Động.', N'Hà Nội, Ninh Bình', 2, 2), -- TourID=5, KM 20%

-- Tours CỦA (TourTypesID=3: Phiêu lưu - Mạo hiểm)
(N'Trekking đỉnh Fansipan', N'Chinh phục nóc nhà Đông Dương, ngắm mây Sa Pa.', N'Lào Cai', 3, 2), -- TourID=6, KM 20%
(N'Chinh phục Tà Xùa', N'Săn mây, cắm trại trên đỉnh, trải nghiệm khó quên.', N'Sơn La', 3, NULL), -- TourID=7, KHÔNG KM

-- Tours CỦA (TourTypesID=4: Du lịch sinh thái)
(N'Miền Tây sông nước', N'Chèo thuyền trên kênh rạch, thăm chợ nổi Cái Răng, vườn trái cây.', N'Cần Thơ, An Giang', 4, 1), -- TourID=8, KM 10%
(N'Rừng ngập mặn Cần Giờ', N'Khám phá rừng UNESCO, quan sát khỉ hoang dã, tắm bùn.', N'TP. Hồ Chí Minh', 4, NULL), -- TourID=9, KHÔNG KM

-- Tours CỦA (TourTypesID=5: City Tour)
(N'Sài Gòn một ngày', N'Bưu điện trung tâm, Nhà thờ Đức Bà, Dinh Độc Lập, Bến Nhà Rồng.', N'TP. Hồ Chí Minh', 5, 4), -- TourID=10, KM 15%

-- Tours CỦA (TourTypesID=6: Tour ẩm thực)
(N'Ẩm thực đường phố Hội An', N'Thưởng thức cao lầu, mì Quảng, bánh bèo, chè Hội An.', N'Quảng Nam', 6, NULL), -- TourID=11, KHÔNG KM

-- Tours CỦA (TourTypesID=7: Tour lịch sử)
(N'Địa đạo Củ Chi - Chiến khu lịch sử', N'Khám phá mạng lưới địa đạo, trải nghiệm làm lính, bắn AK.', N'TP. Hồ Chí Minh', 7, 2), -- TourID=12, KM 20%

-- Tours CỦA (TourTypesID=8: Tour tâm linh)
(N'Hành hương miền Tây - Núi Bà Đen', N'Lễ chùa Bà Đen, thăm Thiền viện Trúc Lâm, Tháp Bà Phú Giáo.', N'Tây Ninh', 8, NULL); -- TourID=13, KHÔNG KM
GO

-- 3.7. Bảng TourDeparture (với TourGuideID) - MỞ RỘNG DỮ LIỆU
-- MỖI TourDeparture chỉ có 1 TourGuide (hoặc NULL nếu chưa phân công)
-- TourGuideID mapping:
-- ID=1: Sanh Tour Guide (UserID=2, Rating 5.0) 
-- ID=2: Nguyễn Thị Minh Châu (UserID=6, Rating 4.8)
-- ID=3: Trần Văn Phong (UserID=7, Rating 4.5)
-- ID=4: Lê Thị Hương (UserID=8, Rating 4.2)
-- ID=5: Phạm Văn Nam (UserID=9, Rating 4.6)
-- ID=6: Hoàng Thị Thu (UserID=10, Rating 4.9)
-- ID=7: Ngô Văn Tú (UserID=11, Rating 4.4)

DECLARE @Today DATE = CAST(GETDATE() AS DATE);
INSERT INTO dbo.TourDeparture (TourID, DayNum, OriginalPrice, DepartureLocation, DepartureTime, ReturnTime, DateCreated, MaxQuantity, TourGuideID)
VALUES
-- TourID=1: Vịnh Hạ Long (có KM 10%)
(1, 3, 4500000.00, N'Hà Nội', DATEADD(day, 7, @Today),  DATEADD(day, 10, @Today), @Today, 30, 1),  -- DeptID=1, Guide: Sanh (⭐5.0)
(1, 4, 5500000.00, N'Hà Nội', DATEADD(day, 15, @Today), DATEADD(day, 18, @Today), @Today, 30, 2),  -- DeptID=2, Guide: Châu (⭐4.8)
(1, 3, 4500000.00, N'Hải Phòng', DATEADD(day, 20, @Today), DATEADD(day, 23, @Today), @Today, 25, 3), -- DeptID=3, Guide: Phong (⭐4.5)

-- TourID=2: Phú Quốc (có KM 15%)
(2, 4, 7500000.00, N'TP. Hồ Chí Minh', DATEADD(day, 10, @Today), DATEADD(day, 14, @Today), @Today, 40, 5),  -- DeptID=4, Guide: Nam (⭐4.6)
(2, 5, 9500000.00, N'Hà Nội', DATEADD(day, 18, @Today), DATEADD(day, 22, @Today), @Today, 35, 6),  -- DeptID=5, Guide: Thu (⭐4.9)

-- TourID=3: Nha Trang (KHÔNG KM)
(3, 4, 5200000.00, N'TP. Hồ Chí Minh', DATEADD(day, 12, @Today), DATEADD(day, 16, @Today), @Today, 35, 5),  -- DeptID=6, Guide: Nam (⭐4.6)
(3, 3, 4200000.00, N'Hà Nội', DATEADD(day, 22, @Today), DATEADD(day, 25, @Today), @Today, 30, NULL),  -- DeptID=7, Chưa phân guide

-- TourID=4: Di sản miền Trung (KHÔNG KM)
(4, 5, 8200000.00, N'TP. Hồ Chí Minh', DATEADD(day, 14, @Today), DATEADD(day, 19, @Today), @Today, 20, 3),  -- DeptID=8, Guide: Phong (⭐4.5)
(4, 6, 9200000.00, N'Hà Nội', DATEADD(day, 21, @Today), DATEADD(day, 26, @Today), @Today, 20, 1),  -- DeptID=9, Guide: Sanh (⭐5.0)

-- TourID=5: Hà Nội - Ninh Bình (có KM 20%)
(5, 3, 3500000.00, N'Hà Nội', DATEADD(day, 5, @Today), DATEADD(day, 8, @Today), @Today, 25, 2),  -- DeptID=10, Guide: Châu (⭐4.8)
(5, 4, 4200000.00, N'Hà Nội', DATEADD(day, 12, @Today), DATEADD(day, 16, @Today), @Today, 25, 4),  -- DeptID=11, Guide: Hương (⭐4.2)

-- TourID=6: Fansipan (có KM 20%)
(6, 4, 3800000.00, N'Hà Nội', DATEADD(day, 25, @Today), DATEADD(day, 29, @Today), @Today, 15, 6),  -- DeptID=12, Guide: Thu (⭐4.9)
(6, 7, 4800000.00, N'Hà Nội', DATEADD(day, 30, @Today), DATEADD(day, 36, @Today), @Today, 15, NULL),  -- DeptID=13, Chưa phân guide

-- TourID=7: Tà Xùa (KHÔNG KM)
(7, 3, 2500000.00, N'Hà Nội', DATEADD(day, 17, @Today), DATEADD(day, 20, @Today), @Today, 12, 1),  -- DeptID=14, Guide: Sanh (⭐5.0)

-- TourID=8: Miền Tây (có KM 10%)
(8, 3, 3200000.00, N'TP. Hồ Chí Minh', DATEADD(day, 8, @Today), DATEADD(day, 11, @Today), @Today, 30, 7),  -- DeptID=15, Guide: Tú (⭐4.4)
(8, 4, 3900000.00, N'Cần Thơ', DATEADD(day, 15, @Today), DATEADD(day, 18, @Today), @Today, 25, 7),  -- DeptID=16, Guide: Tú (⭐4.4)

-- TourID=9: Cần Giờ (KHÔNG KM)
(9, 1, 850000.00, N'TP. Hồ Chí Minh', DATEADD(day, 3, @Today), DATEADD(day, 4, @Today), @Today, 40, 5),  -- DeptID=17, Guide: Nam (⭐4.6)

-- TourID=10: Sài Gòn một ngày (có KM 15%)
(10, 1, 650000.00, N'TP. Hồ Chí Minh', DATEADD(day, 2, @Today), DATEADD(day, 3, @Today), @Today, 50, 5),  -- DeptID=18, Guide: Nam (⭐4.6)
(10, 1, 650000.00, N'TP. Hồ Chí Minh', DATEADD(day, 9, @Today), DATEADD(day, 10, @Today), @Today, 50, 3),  -- DeptID=19, Guide: Phong (⭐4.5)

-- TourID=11: Ẩm thực Hội An (KHÔNG KM)
(11, 1, 1200000.00, N'Đà Nẵng', DATEADD(day, 6, @Today), DATEADD(day, 7, @Today), @Today, 20, 2),  -- DeptID=20, Guide: Châu (⭐4.8)

-- TourID=12: Địa đạo Củ Chi (có KM 20%)
(12, 1, 950000.00, N'TP. Hồ Chí Minh', DATEADD(day, 4, @Today), DATEADD(day, 5, @Today), @Today, 45, 7),  -- DeptID=21, Guide: Tú (⭐4.4)
(12, 1, 950000.00, N'TP. Hồ Chí Minh', DATEADD(day, 11, @Today), DATEADD(day, 12, @Today), @Today, 45, NULL),  -- DeptID=22, Chưa phân guide

-- TourID=13: Núi Bà Đen (KHÔNG KM)
(13, 2, 1800000.00, N'TP. Hồ Chí Minh', DATEADD(day, 13, @Today), DATEADD(day, 15, @Today), @Today, 30, 4);  -- DeptID=23, Guide: Hương (⭐4.2)
GO

-- 3.8. Dữ liệu Booking ban đầu (Đảm bảo TotalBooked < MaxQuantity)
-- 🎯 Tạo bookings cho nhiều customers khác nhau trên các tour khác nhau

-- Customers UserID mapping:
-- UserID=2: Nguyễn Văn Khách (admin kiêm customer, CÓ THỂ ĐĂNG NHẬP với Sanh123@)
-- UserID=4: Trần Thị B
-- UserID=12-18: Các customer mới (Phạm Văn Đức, Hoàng Thị Mai, ...)

INSERT INTO dbo.Booking (UserID, TourDepartureID, PromotionID, Quantity, OriginalPrice, DiscountAmount, PaymentStatus, BookingDate) VALUES

-- ========== TOUR 1: Vịnh Hạ Long ==========
-- DeptID=1: 3 ngày, Max 30 khách, Guide: Sanh (⭐5.0), PromotionID=1 (10%)
(2, 1, 1, 4, 4500000.00, 4500000.00 * 4 * 0.1, 'PAID', DATEADD(day, -5, GETDATE())),      -- Khách (4 người)
(12, 1, 1, 2, 4500000.00, 4500000.00 * 2 * 0.1, 'PAID', DATEADD(day, -4, GETDATE())),    -- Đức (2 người)
(13, 1, NULL, 3, 4500000.00, 0, 'PAID', DATEADD(day, -3, GETDATE())),                    -- Mai (3 người, không KM)
(14, 1, 1, 1, 4500000.00, 4500000.00 * 0.1, 'PENDING', DATEADD(day, -2, GETDATE())),     -- Tuấn (1 người, chưa thanh toán)

-- DeptID=2: 4 ngày, Max 30 khách, Guide: Châu (⭐4.8), PromotionID=1 (10%)
(15, 2, 1, 2, 5500000.00, 5500000.00 * 2 * 0.1, 'PAID', DATEADD(day, -3, GETDATE())),    -- Lan (2 người)
(16, 2, NULL, 5, 5500000.00, 0, 'PAID', DATEADD(day, -2, GETDATE())),                    -- Hùng (5 người, đoàn lớn)

-- ========== TOUR 2: Phú Quốc ==========
-- DeptID=4: 4 ngày, Max 40 khách, Guide: Nam (⭐4.6), PromotionID=4 (15%)
(17, 4, 4, 2, 7500000.00, 7500000.00 * 2 * 0.15, 'PAID', DATEADD(day, -6, GETDATE())),   -- Ngọc (2 người)
(18, 4, 4, 3, 7500000.00, 7500000.00 * 3 * 0.15, 'PAID', DATEADD(day, -5, GETDATE())),   -- Long (3 người)
(4, 4, NULL, 4, 7500000.00, 0, 'PAID', DATEADD(day, -4, GETDATE())),                     -- Trần Thị B (4 người)

-- DeptID=5: 5 ngày, Max 35 khách, Guide: Thu (⭐4.9), PromotionID=4 (15%)
(2, 5, 4, 2, 9500000.00, 9500000.00 * 2 * 0.15, 'PAID', DATEADD(day, -7, GETDATE())),    -- Khách (2 người)

-- ========== TOUR 3: Nha Trang ==========
-- DeptID=6: 4 ngày, Max 35 khách, Guide: Nam (⭐4.6), KHÔNG KM
(12, 6, NULL, 2, 5200000.00, 0, 'PAID', DATEADD(day, -2, GETDATE())),                    -- Đức (2 người)
(13, 6, NULL, 3, 5200000.00, 0, 'PENDING', DATEADD(day, -1, GETDATE())),                 -- Mai (3 người, chưa TT)

-- ========== TOUR 4: Di sản miền Trung ==========
-- DeptID=8: 5 ngày, Max 20 khách, Guide: Phong (⭐4.5), KHÔNG KM
(14, 8, NULL, 2, 8200000.00, 0, 'PAID', DATEADD(day, -4, GETDATE())),                    -- Tuấn (2 người)

-- DeptID=9: 6 ngày, Max 20 khách, Guide: Sanh (⭐5.0), KHÔNG KM
(15, 9, NULL, 2, 9200000.00, 0, 'PAID', DATEADD(day, -6, GETDATE())),                    -- Lan (2 người)
(16, 9, NULL, 3, 9200000.00, 0, 'PAID', DATEADD(day, -5, GETDATE())),                    -- Hùng (3 người)
(17, 9, NULL, 4, 9200000.00, 0, 'PAID', DATEADD(day, -4, GETDATE())),                    -- Ngọc (4 người)

-- ========== TOUR 5: Hà Nội - Ninh Bình ==========
-- DeptID=10: 3 ngày, Max 25 khách, Guide: Châu (⭐4.8), PromotionID=2 (20%)
(18, 10, 2, 2, 3500000.00, 3500000.00 * 2 * 0.2, 'PAID', DATEADD(day, -3, GETDATE())),   -- Long (2 người)
(2, 10, 2, 1, 3500000.00, 3500000.00 * 0.2, 'PAID', DATEADD(day, -2, GETDATE())),        -- Khách (1 người)

-- ========== TOUR 8: Miền Tây ==========
-- DeptID=15: 3 ngày, Max 30 khách, Guide: Tú (⭐4.4), PromotionID=1 (10%)
(4, 15, 1, 3, 3200000.00, 3200000.00 * 3 * 0.1, 'PAID', DATEADD(day, -4, GETDATE())),    -- Trần Thị B (3 người)

-- DeptID=16: 4 ngày, Max 25 khách, Guide: Tú (⭐4.4), PromotionID=1 (10%)
(12, 16, 1, 2, 3900000.00, 3900000.00 * 2 * 0.1, 'PENDING', DATEADD(day, -1, GETDATE())), -- Đức (2 người, chưa TT)

-- ========== TOUR 10: Sài Gòn một ngày ==========
-- DeptID=18: 1 ngày, Max 50 khách, Guide: Nam (⭐4.6), PromotionID=4 (15%)
(13, 18, 4, 1, 650000.00, 650000.00 * 0.15, 'PAID', DATEADD(day, -1, GETDATE())),        -- Mai (1 người)
(14, 18, 4, 2, 650000.00, 650000.00 * 2 * 0.15, 'PAID', DATEADD(day, -1, GETDATE())),    -- Tuấn (2 người)

-- ========== TOUR 12: Địa đạo Củ Chi ==========
-- DeptID=21: 1 ngày, Max 45 khách, Guide: Tú (⭐4.4), PromotionID=2 (20%)
(15, 21, 2, 1, 950000.00, 950000.00 * 0.2, 'PAID', DATEADD(day, -2, GETDATE())),         -- Lan (1 người)
(16, 21, 2, 3, 950000.00, 950000.00 * 3 * 0.2, 'PAID', DATEADD(day, -1, GETDATE())),     -- Hùng (3 người)

-- Booking 9: Phạm Văn Đức (1 người) - Đi lại lần 2
-- Booking 9: Customer Nguyễn Văn Khách (1 người) - UserID = 2
(2, 4, NULL, 1, 9200000.00, 0, 'PAID', DATEADD(day, -3, GETDATE())),

-- Booking 10: Hoàng Thị Mai (2 người) - Đi lại
(10, 4, NULL, 2, 9200000.00, 0, 'PAID', DATEADD(day, -2, GETDATE()));

-- 🔍 Tổng hành khách cho Sanh Tour Guide:
-- - TourDepartureID 1 (Vịnh Hạ Long): 15 khách (4+2+3+1+5) / 30 chỗ
-- - TourDepartureID 4 (Huế - Đà Nẵng): 12 khách (2+3+4+1+2) / 20 chỗ
-- 📊 Tổng cộng: 27 hành khách

-- Bookings cho các departures khác (để có dữ liệu test)
-- TourDepartureID 3: TP.HCM (Max 20, Guide: Trần Văn Phong - TourGuideID=3)
INSERT INTO dbo.Booking (UserID, TourDepartureID, PromotionID, Quantity, OriginalPrice, DiscountAmount, PaymentStatus, BookingDate) VALUES
(11, 3, NULL, 5, 8200000.00, 0, 'PAID', GETDATE());
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
    
    /*=================================================================
      STORED PROCEDURE: Thêm đăng ký booking tour
      Chức năng:
        1. Kiểm tra tính hợp lệ của lịch khởi hành (TourDeparture) và số lượng khách
        2. Kiểm tra còn đủ chỗ trống hay không
        3. Áp dụng khuyến mãi (nếu có và còn hạn)
        4. Tính toán giá sau giảm và tạo booking
      Input:  UserID (id người dùng), TourDepartureID (id lịch khởi hành), PromotionID (id khuyến mãi), Quantity (số khách)
      Output: NewBookingID (ID của booking vừa tạo)
    =================================================================*/
    
    -- Khai báo biến
    DECLARE @MaxQuantity INT; -- Số chỗ tối đa của TourDeparture
    DECLARE @BookedQuantity INT; -- Số chỗ đã được đặt
    DECLARE @AvailableSlots INT; -- Số chỗ còn trống
    DECLARE @OriginalPrice DECIMAL(18,2); -- Giá gốc của TourDeparture
    DECLARE @TourID INT; -- ID của Tour (để kiểm tra khuyến mãi)
    DECLARE @PromotionPercent DECIMAL(5,2) = 0; -- Phần trăm khuyến mãi
    DECLARE @DiscountAmount DECIMAL(18,2); -- Số tiền giảm giá
    
    /*-----------------------------------------------------------------
      BƯỚC 1: Lấy thông tin TourDeparture (giá, tour, số chỗ tối đa)
    -----------------------------------------------------------------*/
    SELECT 
        @MaxQuantity = MaxQuantity,
        @TourID = TourID,
        @OriginalPrice = OriginalPrice
    FROM dbo.TourDeparture 
    WHERE TourDepartureID = @p_TourDepartureID;

    -- Validation: TourDeparture phải tồn tại và có giá
    IF @TourID IS NULL OR @OriginalPrice IS NULL
    BEGIN
        RAISERROR(N'❌ Lỗi: ID khởi hành tour không hợp lệ hoặc thiếu giá gốc.', 16, 1);
        RETURN;
    END

    /*-----------------------------------------------------------------
      BƯỚC 2: Kiểm tra còn đủ chỗ trống không
    -----------------------------------------------------------------*/
    -- Đếm số khách đã đặt (chỉ tính PENDING và PAID, không tính CANCELLED)
    SELECT @BookedQuantity = ISNULL(SUM(Quantity), 0)
    FROM dbo.Booking
    WHERE TourDepartureID = @p_TourDepartureID 
      AND PaymentStatus IN ('PENDING', 'PAID');

    SET @AvailableSlots = @MaxQuantity - @BookedQuantity;

    -- Validation: Số lượng khách phải hợp lệ
    IF @p_Quantity <= 0
    BEGIN
        RAISERROR(N'❌ Lỗi: Số lượng khách phải lớn hơn 0.', 16, 1);
        RETURN;
    END
    
    IF @p_Quantity > @AvailableSlots
    BEGIN
        RAISERROR(N'❌ Không đủ chỗ! Chuyến này chỉ còn %d chỗ trống.', 16, 1, @AvailableSlots);
        RETURN;
    END

    /*-----------------------------------------------------------------
      BƯỚC 3: Tính khuyến mãi (nếu có)
    -----------------------------------------------------------------*/
    IF @p_PromotionCodeID IS NOT NULL
    BEGIN
        -- Lấy % khuyến mãi (chỉ áp dụng nếu: đúng tour + còn thời hạn)
        SELECT @PromotionPercent = P.[Percent]
        FROM dbo.Promotion P
        INNER JOIN dbo.Tours T ON P.PromotionID = T.PromotionID
        WHERE P.PromotionID = @p_PromotionCodeID
          AND T.TourID = @TourID
          AND P.StartDate <= GETDATE()
          AND P.EndDate >= GETDATE();
        
        -- Nếu không tìm thấy KM hợp lệ, bỏ qua không áp dụng
        IF @PromotionPercent IS NULL OR @PromotionPercent = 0
        BEGIN
            SET @p_PromotionCodeID = NULL;
            SET @PromotionPercent = 0;
        END
    END

    /*-----------------------------------------------------------------
      BƯỚC 4: Tính tổng tiền sau giảm giá
    -----------------------------------------------------------------*/
    -- DiscountAmount = (Giá gốc × Số lượng) × (% giảm / 100)
    SET @DiscountAmount = (@OriginalPrice * @p_Quantity) * (@PromotionPercent / 100.0);

    /*-----------------------------------------------------------------
      BƯỚC 5: Tạo booking mới
    -----------------------------------------------------------------*/
    BEGIN TRANSACTION;
    
    INSERT INTO dbo.Booking (
        UserID, TourDepartureID, PromotionID, Quantity, 
        OriginalPrice, DiscountAmount, PaymentStatus, BookingDate
    )
    VALUES (
        @p_UserID, @p_TourDepartureID, @p_PromotionCodeID, @p_Quantity, 
        @OriginalPrice, @DiscountAmount, 'PENDING', GETDATE()
    );

    COMMIT TRANSACTION;

    -- Trả về ID của booking vừa tạo
    SELECT SCOPE_IDENTITY() AS NewBookingID;
END
GO

----------------------------------------------------------
-- 5. TRIGGER
----------------------------------------------------------
-- 5.1. Trigger kiểm tra số lượng khách tối đa
IF OBJECT_ID('dbo.trg_Booking_CheckCapacity', 'TR') IS NOT NULL
    DROP TRIGGER dbo.trg_Booking_CheckCapacity;
GO

CREATE TRIGGER dbo.trg_Booking_CheckCapacity
ON dbo.Booking
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    /*=================================================================
      TRIGGER: Kiểm tra số lượng khách không vượt quá MaxQuantity
      
      Mục đích: 
        - Đảm bảo tổng số khách đặt tour không vượt quá giới hạn
        - Chỉ tính các booking có status PENDING hoặc PAID
        - Không tính các booking đã CANCELLED
      
      Hoạt động:
        - Tự động chạy sau mỗi lần INSERT hoặc UPDATE vào bảng Booking
        - Nếu phát hiện vượt quá → ROLLBACK transaction
    =================================================================*/
    
    -- Chỉ kiểm tra nếu có booking PENDING hoặc PAID (bỏ qua CANCELLED)
    IF EXISTS (
        SELECT 1
        FROM inserted i
        WHERE i.PaymentStatus IN ('PENDING', 'PAID')
    )
    BEGIN
        -- Loop qua từng TourDeparture bị ảnh hưởng bởi INSERT/UPDATE
        DECLARE @TourDepartureID INT;
        DECLARE cur CURSOR FOR
            SELECT DISTINCT TourDepartureID FROM inserted;
        
        OPEN cur;
        FETCH NEXT FROM cur INTO @TourDepartureID;

        WHILE @@FETCH_STATUS = 0
        BEGIN
            DECLARE @MaxQuantity INT;
            DECLARE @TotalBooked INT;

            -- Lấy số chỗ tối đa
            SELECT @MaxQuantity = MaxQuantity
            FROM dbo.TourDeparture
            WHERE TourDepartureID = @TourDepartureID;

            -- Đếm tổng số khách đã đặt (PENDING + PAID)
            SELECT @TotalBooked = ISNULL(SUM(Quantity), 0)
            FROM dbo.Booking
            WHERE TourDepartureID = @TourDepartureID
              AND PaymentStatus IN ('PENDING', 'PAID');

            -- Kiểm tra: Nếu vượt quá → Rollback
            IF @TotalBooked > @MaxQuantity
            BEGIN
                -- Thông báo lỗi chi tiết
                DECLARE @ErrorMsg NVARCHAR(500);
                SET @ErrorMsg = N'❌ VƯỢT QUÁ SỐ LƯỢNG TỐI ĐA!' + CHAR(13) + CHAR(10) +
                                N'   • Chuyến khởi hành ID: ' + CAST(@TourDepartureID AS NVARCHAR(10)) + CHAR(13) + CHAR(10) +
                                N'   • Số chỗ tối đa: ' + CAST(@MaxQuantity AS NVARCHAR(10)) + CHAR(13) + CHAR(10) +
                                N'   • Tổng đã đặt: ' + CAST(@TotalBooked AS NVARCHAR(10)) + CHAR(13) + CHAR(10) +
                                N'   • Vượt quá: ' + CAST(@TotalBooked - @MaxQuantity AS NVARCHAR(10)) + N' chỗ';
                
                RAISERROR(@ErrorMsg, 16, 1);
                ROLLBACK TRANSACTION;
                
                -- Cleanup cursor trước khi return
                CLOSE cur;
                DEALLOCATE cur;
                RETURN;
            END
            
            FETCH NEXT FROM cur INTO @TourDepartureID;
        END

        -- Cleanup cursor
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
# 🚀 Hướng dẫn triển khai Migration

## 📋 Checklist trước khi bắt đầu

- [ ] Đã backup database
- [ ] Đã commit code hiện tại vào Git
- [ ] Đã test trên môi trường development
- [ ] Đã thông báo team/users về downtime (nếu có)

---

## 🎯 Các bước thực hiện (Theo thứ tự)

### BƯỚC 1: Backup Database ⚠️ BẮT BUỘC
```sql
USE master;
GO

BACKUP DATABASE TourismManagementSystem 
TO DISK = 'C:\Backups\TourismManagementSystem_Backup_20251019.bak'
WITH FORMAT, 
     NAME = 'Full Backup Before Migration',
     DESCRIPTION = 'Backup before removing Tours_Promotion table';
GO

-- Verify backup
RESTORE VERIFYONLY 
FROM DISK = 'C:\Backups\TourismManagementSystem_Backup_20251019.bak';
GO
```

✅ **Checkpoint:** Backup file được tạo thành công

---

### BƯỚC 2: Dừng Backend Application
```bash
# Dừng Spring Boot application
# Nếu đang chạy trong terminal, press Ctrl+C
# Hoặc kill process:
# Windows:
taskkill /F /IM java.exe

# macOS/Linux:
pkill -f "spring-boot"
```

✅ **Checkpoint:** Backend đã dừng hoàn toàn

---

### BƯỚC 3: Chạy Migration Script

#### 3.1. Mở SQL Server Management Studio hoặc Azure Data Studio

#### 3.2. Kết nối đến database
```
Server: localhost (hoặc server của bạn)
Database: TourismManagementSystem
Authentication: Windows Authentication hoặc SQL Server Authentication
```

#### 3.3. Mở file và thực thi
```
File → Open → migration_remove_tours_promotion.sql
Execute (F5)
```

#### 3.4. Xem kết quả
```
Messages tab sẽ hiển thị:
========================================
✅ MIGRATION HOÀN TẤT!
========================================
```

✅ **Checkpoint:** Migration script chạy thành công, không có lỗi

---

### BƯỚC 4: Verify Database Changes

```sql
-- 1. Kiểm tra cột mới
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Tours' AND COLUMN_NAME = 'PromotionID';

-- Kết quả mong đợi:
-- COLUMN_NAME   DATA_TYPE   IS_NULLABLE
-- PromotionID   int         YES

-- 2. Kiểm tra bảng cũ đã xóa
SELECT * FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME = 'Tours_Promotion';

-- Kết quả mong đợi: 0 dòng

-- 3. Kiểm tra Foreign Key
SELECT 
    fk.name AS ForeignKeyName,
    OBJECT_NAME(fk.parent_object_id) AS TableName,
    COL_NAME(fkc.parent_object_id, fkc.parent_column_id) AS ColumnName,
    OBJECT_NAME(fk.referenced_object_id) AS ReferencedTable
FROM sys.foreign_keys fk
INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
WHERE fk.name = 'FK_Tours_Promotion';

-- Kết quả mong đợi:
-- ForeignKeyName         TableName   ColumnName   ReferencedTable
-- FK_Tours_Promotion     Tours       PromotionID  Promotion

-- 4. Kiểm tra Index
SELECT name, type_desc 
FROM sys.indexes
WHERE object_id = OBJECT_ID('dbo.Tours') AND name = 'IX_Tours_PromotionID';

-- Kết quả mong đợi:
-- name                   type_desc
-- IX_Tours_PromotionID   NONCLUSTERED

-- 5. Xem sample data
SELECT TOP 5
    T.TourID,
    T.TourName,
    T.PromotionID,
    P.PromotionName,
    P.Percent
FROM Tours T
LEFT JOIN Promotion P ON T.PromotionID = P.PromotionID;
```

✅ **Checkpoint:** Tất cả checks đều pass

---

### BƯỚC 5: Build Backend

```bash
cd travel-backend

# Clean build
./mvnw clean install

# Hoặc trên Windows:
mvnw.cmd clean install
```

**Kết quả mong đợi:**
```
[INFO] BUILD SUCCESS
[INFO] Total time: XX s
```

✅ **Checkpoint:** Backend build thành công, không có compile errors

---

### BƯỚC 6: Start Backend

```bash
# Trong thư mục travel-backend
./mvnw spring-boot:run

# Hoặc:
mvnw.cmd spring-boot:run
```

**Kiểm tra logs:**
```
...
Tomcat started on port(s): 8080 (http)
Started TravelApplication in X.XXX seconds
```

✅ **Checkpoint:** Backend khởi động thành công

---

### BƯỚC 7: Test Backend APIs

#### Test 1: GET Tours
```bash
curl http://localhost:8080/api/tours
```

**Kỳ vọng:** Trả về list tours với promotion (nếu có)

#### Test 2: GET Tour by ID
```bash
curl http://localhost:8080/api/tours/1
```

**Kỳ vọng:** Trả về tour với promotion object

#### Test 3: POST Tour (với promotion)
```bash
curl -X POST http://localhost:8080/api/tours \
  -H "Content-Type: application/json" \
  -d '{
    "tourName": "Tour Test Migration",
    "description": "Test tour after migration",
    "touristDestination": "Test Location",
    "tourType": {"tourTypeID": 1},
    "promotion": {"promotionID": 1}
  }'
```

**Kỳ vọng:** Tour được tạo với promotionID = 1

#### Test 4: POST Tour (không có promotion)
```bash
curl -X POST http://localhost:8080/api/tours \
  -H "Content-Type: application/json" \
  -d '{
    "tourName": "Tour No Promo",
    "description": "Test tour without promotion",
    "touristDestination": "Test Location",
    "tourType": {"tourTypeID": 1},
    "promotion": null
  }'
```

**Kỳ vọng:** Tour được tạo với promotionID = NULL

#### Test 5: PUT Tour (đổi promotion)
```bash
curl -X PUT http://localhost:8080/api/tours/1 \
  -H "Content-Type: application/json" \
  -d '{
    "tourName": "Updated Tour",
    "description": "Updated description",
    "touristDestination": "Updated Location",
    "tourType": {"tourTypeID": 1},
    "promotion": {"promotionID": 2}
  }'
```

**Kỳ vọng:** Tour được update với promotion mới

#### Test 6: PUT Tour (xóa promotion)
```bash
curl -X PUT http://localhost:8080/api/tours/1 \
  -H "Content-Type: application/json" \
  -d '{
    "tourName": "Tour Without Promo",
    "description": "Updated description",
    "touristDestination": "Updated Location",
    "tourType": {"tourTypeID": 1},
    "promotion": null
  }'
```

**Kỳ vọng:** Tour được update, promotionID = NULL

✅ **Checkpoint:** Tất cả API tests đều pass

---

### BƯỚC 8: Start Frontend (Không cần build lại)

```bash
cd travel-frontend
ng serve

# Hoặc nếu đã build:
ng serve --port 4200
```

**Truy cập:** http://localhost:4200

✅ **Checkpoint:** Frontend khởi động thành công

---

### BƯỚC 9: Test Frontend

#### Test trên UI:

1. **Login admin**
   - Navigate to `/login`
   - Login với admin credentials
   - ✅ Đăng nhập thành công

2. **Xem danh sách tours**
   - Navigate to `/admin/tours`
   - ✅ Bảng hiển thị tours với promotion

3. **Thêm tour mới (có promotion)**
   - Click "Thêm Tour mới"
   - Fill form
   - Chọn promotion trong dropdown
   - Submit
   - ✅ Tour được tạo và hiển thị trong bảng

4. **Thêm tour mới (KHÔNG có promotion)**
   - Click "Thêm Tour mới"
   - Fill form
   - Chọn "-- Không áp dụng khuyến mãi --"
   - Submit
   - ✅ Tour được tạo, không có promotion

5. **Edit tour (đổi promotion)**
   - Click nút "Sửa" trên 1 tour
   - Đổi promotion trong dropdown
   - Click "Cập nhật Tour"
   - ✅ Promotion được cập nhật

6. **Edit tour (xóa promotion)**
   - Click nút "Sửa" trên 1 tour có promotion
   - Chọn "-- Không áp dụng khuyến mãi --"
   - Click "Cập nhật Tour"
   - ✅ Promotion bị xóa

7. **Delete tour**
   - Click nút "Xóa"
   - Confirm trong modal
   - ✅ Tour bị xóa

✅ **Checkpoint:** Tất cả UI tests đều pass

---

### BƯỚC 10: Performance Check

```sql
-- Check execution plan
SET STATISTICS IO ON;
SET STATISTICS TIME ON;

-- Query tours với promotion
SELECT 
    T.TourID,
    T.TourName,
    T.TouristDestination,
    P.PromotionName,
    P.Percent
FROM Tours T
LEFT JOIN Promotion P ON T.PromotionID = P.PromotionID;

SET STATISTICS IO OFF;
SET STATISTICS TIME OFF;
```

**Kỳ vọng:**
- Logical reads: Thấp
- Scan count: 1-2
- CPU time: < 50ms

✅ **Checkpoint:** Performance tốt

---

## 🔥 Troubleshooting

### Lỗi 1: "Tours_Promotion table not found"
**Nguyên nhân:** Migration đã chạy trước đó  
**Giải pháp:** Bỏ qua, đây là normal

### Lỗi 2: "Foreign key constraint error"
**Nguyên nhân:** Có promotion không tồn tại  
**Giải pháp:**
```sql
-- Xóa các PromotionID không hợp lệ
UPDATE Tours 
SET PromotionID = NULL 
WHERE PromotionID NOT IN (SELECT PromotionID FROM Promotion);
```

### Lỗi 3: Backend không compile
**Nguyên nhân:** JPA cache  
**Giải pháp:**
```bash
./mvnw clean
rm -rf target/
./mvnw install
```

### Lỗi 4: "Cannot find column PromotionID"
**Nguyên nhân:** Migration chưa chạy  
**Giải pháp:** Quay lại BƯỚC 3

---

## 📊 Rollback Plan (Nếu cần)

### Option 1: Restore từ backup
```sql
USE master;
GO

-- Ngắt tất cả connections
ALTER DATABASE TourismManagementSystem SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
GO

-- Restore
RESTORE DATABASE TourismManagementSystem
FROM DISK = 'C:\Backups\TourismManagementSystem_Backup_20251019.bak'
WITH REPLACE;
GO

-- Đưa database về multi-user
ALTER DATABASE TourismManagementSystem SET MULTI_USER;
GO
```

### Option 2: Revert code
```bash
# Revert Git commits
git log --oneline  # Find commit hash
git revert <commit-hash>

# Rebuild
./mvnw clean install
```

---

## ✅ Checklist sau khi hoàn tất

- [ ] Database đã được migrate
- [ ] Bảng Tours_Promotion đã bị xóa
- [ ] Cột Tours.PromotionID tồn tại và có data
- [ ] Backend build thành công
- [ ] Backend APIs hoạt động
- [ ] Frontend hiển thị đúng
- [ ] Tất cả UI tests pass
- [ ] Performance tốt
- [ ] Backup database mới (sau migration)
- [ ] Cập nhật documentation
- [ ] Thông báo team về thay đổi

---

## 📞 Support

Nếu gặp vấn đề:
1. Check logs: `travel-backend/logs/`
2. Check database: Chạy verify queries ở BƯỚC 4
3. Rollback nếu cần (Option 1 hoặc 2)

---

**Migration Version:** 1.0  
**Date:** 19/10/2025  
**Estimated Time:** 30-45 minutes  
**Risk Level:** Medium (có backup và rollback plan)

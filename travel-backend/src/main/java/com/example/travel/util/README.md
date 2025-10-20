# 🛠️ Utility Tools

Thư mục này chứa các công cụ hỗ trợ cho dự án.

## 📋 Danh sách Tools

### 1. PasswordHashGenerator.java

**Mục đích**: Tạo BCrypt hash cho mật khẩu để insert trực tiếp vào database

**Khi nào dùng**:
- ✅ Tạo tài khoản admin mới trong SQL seed data
- ✅ Reset password cho user qua database
- ✅ Tạo tài khoản test với mật khẩu cụ thể
- ✅ Seed data cho môi trường Dev/Staging/Production

**Cách sử dụng**:

1. **Mở file** `PasswordHashGenerator.java`

2. **Thay đổi mật khẩu** tại dòng 30:
   ```java
   String password = "YourPasswordHere";
   ```

3. **Chạy tool**:
   ```bash
   cd travel-backend
   ./mvnw exec:java -Dexec.mainClass="com.example.travel.util.PasswordHashGenerator" -Dexec.cleanupDaemonThreads=false
   ```

4. **Copy BCrypt hash** từ output

5. **Paste vào SQL file** (ví dụ: `SQLQuery_QLDL_Fix18102025.sql`)

**Output mẫu**:
```
╔════════════════════════════════════════════════════╗
║     BCrypt Password Hash Generator v1.0           ║
╚════════════════════════════════════════════════════╝

📝 Original Password: Sanh123@
🔐 BCrypt Hash:
   $2a$10$3E9UyqDUk4Js0H9.XgXNaOfXW63mY7xUJDRa.P0cUOU9nbL72mHtu

✅ Verification Test:
   Password matches: ✓ SUCCESS
```

**SQL Examples được generate**:
- Tạo Admin (RoleID = 1)
- Tạo Customer (RoleID = 2)
- Tạo Guide (RoleID = 3)

---

## ⚠️ Lưu ý quan trọng

### BCrypt Hash là ngẫu nhiên!
- Mỗi lần chạy tool sẽ tạo ra hash **KHÁC NHAU**
- Đây là tính năng bảo mật của BCrypt (random salt)
- Hash khác nhau nhưng **VẪN VERIFY ĐÚNG** với cùng 1 password

### Ví dụ:
```java
// Lần 1:
Password: "Sanh123@"
Hash: "$2a$10$ABC...xyz"

// Lần 2 (cùng password):
Password: "Sanh123@"
Hash: "$2a$10$DEF...uvw"  // ← KHÁC nhưng vẫn đúng!

// Cả 2 hash đều verify thành công với password "Sanh123@"
```

---

## 🔐 Bảo mật

- ❌ **KHÔNG** commit mật khẩu plaintext vào Git
- ❌ **KHÔNG** hardcode mật khẩu thật trong code
- ✅ **CHỈ** dùng BCrypt hash trong database
- ✅ **ĐỔI** mật khẩu admin trước khi deploy production

---

## 📚 Tài liệu tham khảo

- [BCrypt Documentation](https://en.wikipedia.org/wiki/Bcrypt)
- [Spring Security Password Encoding](https://docs.spring.io/spring-security/reference/features/authentication/password-storage.html)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)

---

**Version**: 1.0  
**Last Updated**: 20/10/2025  
**Author**: QuanLyDuLich Development Team

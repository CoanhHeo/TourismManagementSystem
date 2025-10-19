package com.example.travel.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * ============================================================
 * BCrypt Password Hash Generator Utility
 * ============================================================
 * 
 * CÔNG DỤNG:
 * - Tạo BCrypt hash để insert trực tiếp vào SQL
 * - Giúp tạo tài khoản admin/test trong database seed
 * - Hỗ trợ reset password thủ công khi cần
 * 
 * CÁCH DÙNG:
 * 1. Thay đổi mật khẩu ở dòng 30 (String password = "...")
 * 2. Chạy lệnh:
 *    ./mvnw exec:java -Dexec.mainClass="com.example.travel.util.PasswordHashGenerator" -Dexec.cleanupDaemonThreads=false
 * 3. Copy BCrypt hash từ output
 * 4. Paste vào file SQL
 * 
 * LƯU Ý:
 * - Mỗi lần chạy sẽ tạo ra hash KHÁC NHAU (do BCrypt salt ngẫu nhiên)
 * - Đây là tính năng bảo mật, hoàn toàn BÌNH THƯỜNG
 * - Hash khác nhau nhưng vẫn verify đúng với cùng 1 password
 * 
 * ============================================================
 */
public class PasswordHashGenerator {
    
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        // ============================================================
        // THAY ĐỔI MẬT KHẨU TẠI ĐÂY 👇
        // ============================================================
        String password = "Sanh123@";
        // ============================================================
        
        String hashedPassword = encoder.encode(password);
        
        System.out.println("\n╔════════════════════════════════════════════════════╗");
        System.out.println("║     BCrypt Password Hash Generator v1.0           ║");
        System.out.println("╚════════════════════════════════════════════════════╝");
        System.out.println("\n📝 Original Password: " + password);
        System.out.println("🔐 BCrypt Hash:\n   " + hashedPassword);
        
        // Test verification
        System.out.println("\n✅ Verification Test:");
        boolean matches = encoder.matches(password, hashedPassword);
        System.out.println("   Password matches: " + (matches ? "✓ SUCCESS" : "✗ FAILED"));
        
        System.out.println("\n╔════════════════════════════════════════════════════╗");
        System.out.println("║     SQL INSERT EXAMPLES                            ║");
        System.out.println("╚════════════════════════════════════════════════════╝");
        
        // Example 1: Admin user
        System.out.println("\n-- 1️⃣  Tạo Admin (RoleID = 1):");
        System.out.println("INSERT INTO dbo.Users (Fullname, Gender, Email, PasswordHash, PhoneNumber, Age, [Address], IsActive, RoleID)");
        System.out.println("VALUES (N'Admin User', 'Male', 'admin@example.com', N'" + hashedPassword + "', '0909999999', 30, N'Hà Nội', 1, 1);");
        
        // Example 2: Customer user
        System.out.println("\n-- 2️⃣  Tạo Customer (RoleID = 2):");
        System.out.println("INSERT INTO dbo.Users (Fullname, Gender, Email, PasswordHash, PhoneNumber, Age, [Address], IsActive, RoleID)");
        System.out.println("VALUES (N'Nguyễn Văn A', 'Male', 'customer@example.com', N'" + hashedPassword + "', '0909888888', 25, N'TP.HCM', 1, 2);");
        
        // Example 3: Guide user
        System.out.println("\n-- 3️⃣  Tạo Guide (RoleID = 3):");
        System.out.println("INSERT INTO dbo.Users (Fullname, Gender, Email, PasswordHash, PhoneNumber, Age, [Address], IsActive, RoleID)");
        System.out.println("VALUES (N'Hướng dẫn viên ABC', 'Female', 'guide@example.com', N'" + hashedPassword + "', '0909777777', 28, N'Đà Nẵng', 1, 3);");
        
        System.out.println("\n╔════════════════════════════════════════════════════╗");
        System.out.println("║     TIPS & NOTES                                   ║");
        System.out.println("╚════════════════════════════════════════════════════╝");
        System.out.println("💡 Mỗi lần chạy sẽ tạo hash KHÁC NHAU (do BCrypt salt)");
        System.out.println("💡 Hash khác nhau NHƯNG vẫn verify đúng cùng password");
        System.out.println("💡 Copy toàn bộ hash bao gồm cả '$2a$10$...'");
        System.out.println("💡 Dùng single quote N'...' trong SQL để tránh lỗi");
        System.out.println("\n✨ Done! Copy hash ở trên và paste vào SQL file.\n");
    }
}

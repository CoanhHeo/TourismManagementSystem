package com.example.travel.controller;

import com.example.travel.entity.Role;
import com.example.travel.entity.User;
import com.example.travel.repository.BookingRepository;
import com.example.travel.repository.RoleRepository;
import com.example.travel.repository.TourRepository;
import com.example.travel.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    
    @Autowired
    private TourRepository tourRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Get dashboard statistics
     * GET /api/admin/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Count total tours
        long totalTours = tourRepository.count();
        
        // Count total customers (users with Customer role - assuming RoleID 2 is Customer)
        long totalCustomers = userRepository.countByRole_RoleID(2);
        
        // Calculate total revenue from paid bookings
        Double totalRevenue = bookingRepository.calculateTotalRevenue();
        if (totalRevenue == null) {
            totalRevenue = 0.0;
        }
        
        // Count total bookings
        long totalBookings = bookingRepository.count();
        
        // Count pending bookings
        long pendingBookings = bookingRepository.countByPaymentStatus("PENDING");
        
        // Count paid bookings
        long paidBookings = bookingRepository.countByPaymentStatus("PAID");
        
        stats.put("totalTours", totalTours);
        stats.put("totalCustomers", totalCustomers);
        stats.put("totalRevenue", totalRevenue);
        stats.put("totalBookings", totalBookings);
        stats.put("pendingBookings", pendingBookings);
        stats.put("paidBookings", paidBookings);
        stats.put("success", true);
        
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Get all users (Admin only)
     * GET /api/admin/users
     */
    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<User> users = userRepository.findAll();
        
        List<Map<String, Object>> userList = users.stream()
            .map(user -> {
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("customerID", user.getUserID());
                userMap.put("tenKhachHang", user.getFullname());
                userMap.put("email", user.getEmail());
                userMap.put("dienThoai", user.getPhoneNumber());
                userMap.put("diaChi", user.getAddress());
                userMap.put("ngaySinh", null); // Backend doesn't have birthdate field
                userMap.put("role", user.getRole().getRoleName().toLowerCase());
                userMap.put("trangThai", user.getIsActive()); // Get actual status from DB
                userMap.put("ngayTao", user.getDateCreated());
                return userMap;
            })
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(userList);
    }

    /**
     * Toggle user status (lock/unlock)
     * PUT /api/admin/users/{id}/status
     */
    @PutMapping("/users/{id}/status")
    public ResponseEntity<Map<String, Object>> toggleUserStatus(
            @PathVariable Integer id,
            @RequestBody Map<String, Boolean> payload) {
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));
        
        Boolean newStatus = payload.get("trangThai");
        if (newStatus == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Trạng thái không hợp lệ"));
        }
        
        user.setIsActive(newStatus);
        userRepository.save(user);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", newStatus ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản");
        response.put("userId", id);
        response.put("newStatus", newStatus);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Delete user
     * DELETE /api/admin/users/{id}
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));
        
        // Prevent deleting admin users
        if ("ADMIN".equalsIgnoreCase(user.getRole().getRoleName())) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "success", false, 
                            "message", "Không thể xóa tài khoản Admin"
                    ));
        }
        
        // Check if user has bookings
        long bookingCount = bookingRepository.countByUser_UserID(id);
        if (bookingCount > 0) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "success", false,
                            "message", "Không thể xóa user có lịch sử đặt tour. Hãy khóa tài khoản thay vì xóa."
                    ));
        }
        
        userRepository.delete(user);
        
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đã xóa user thành công",
                "userId", id
        ));
    }

    /**
     * Create new user
     * POST /api/admin/users
     */
    @PostMapping("/users")
    public ResponseEntity<Map<String, Object>> createUser(@RequestBody Map<String, Object> payload) {
        try {
            // Validate required fields
            String fullname = (String) payload.get("fullname");
            String email = (String) payload.get("email");
            String password = (String) payload.get("password");
            Integer roleId = (Integer) payload.get("roleId");

            if (fullname == null || fullname.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "message", "Họ tên không được để trống"));
            }

            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "message", "Email không được để trống"));
            }

            if (password == null || password.length() < 6) {
                return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "message", "Mật khẩu phải có ít nhất 6 ký tự"));
            }

            if (roleId == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "message", "Vui lòng chọn role"));
            }

            // Check if email already exists
            if (userRepository.findByEmail(email).isPresent()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "message", "Email đã tồn tại trong hệ thống"));
            }

            // Get role
            Role role = roleRepository.findById(roleId)
                    .orElseThrow(() -> new RuntimeException("Role không tồn tại"));

            // Create new user
            User newUser = new User();
            newUser.setFullname(fullname);
            newUser.setEmail(email);
            newUser.setPasswordHash(passwordEncoder.encode(password));
            newUser.setGender((String) payload.get("gender"));
            newUser.setPhoneNumber((String) payload.get("phoneNumber"));
            
            // Parse age
            Object ageObj = payload.get("age");
            if (ageObj != null) {
                if (ageObj instanceof Integer) {
                    newUser.setAge((Integer) ageObj);
                } else if (ageObj instanceof String) {
                    try {
                        newUser.setAge(Integer.parseInt((String) ageObj));
                    } catch (NumberFormatException e) {
                        // Ignore invalid age
                    }
                }
            }
            
            newUser.setAddress((String) payload.get("address"));
            newUser.setRole(role);
            newUser.setIsActive(true);
            newUser.setDateCreated(LocalDateTime.now());

            // Save user
            User savedUser = userRepository.save(newUser);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Tạo user thành công");
            response.put("userId", savedUser.getUserID());
            response.put("fullname", savedUser.getFullname());
            response.put("email", savedUser.getEmail());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of(
                            "success", false,
                            "message", "Lỗi khi tạo user: " + e.getMessage()
                    ));
        }
    }
}

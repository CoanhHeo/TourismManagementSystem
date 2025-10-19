package com.example.travel.controller;

import com.example.travel.dto.UserRegistrationDto;
import com.example.travel.entity.User;
import com.example.travel.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * Register a new customer
     * POST /api/users/register
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerCustomer(@RequestBody UserRegistrationDto registrationDto) {
        try {
            User user = userService.registerCustomer(registrationDto);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đăng ký thành công");
            response.put("userID", user.getUserID());
            response.put("email", user.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Authenticate user (login)
     * POST /api/users/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        try {
            String email = credentials.get("email");
            String password = credentials.get("password");

            User user = userService.authenticate(email, password);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Login successful");
            response.put("user", createUserResponse(user));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    /**
     * Get user by ID
     * GET /api/users/{userID}
     */
    @GetMapping("/{userID}")
    public ResponseEntity<?> getUserById(@PathVariable Integer userID) {
        try {
            User user = userService.getUserById(userID);
            return ResponseEntity.ok(createUserResponse(user));
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    /**
     * Update user profile
     * PUT /api/users/{userID}
     */
    @PutMapping("/{userID}")
    public ResponseEntity<?> updateUser(
            @PathVariable Integer userID,
            @RequestBody UserRegistrationDto updateDto) {
        try {
            User user = userService.updateUser(userID, updateDto);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User updated successfully");
            response.put("user", createUserResponse(user));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Change password
     * PUT /api/users/{userID}/change-password
     */
    @PutMapping("/{userID}/change-password")
    public ResponseEntity<?> changePassword(
            @PathVariable Integer userID,
            @RequestBody Map<String, String> passwords) {
        try {
            String oldPassword = passwords.get("oldPassword");
            String newPassword = passwords.get("newPassword");

            userService.changePassword(userID, oldPassword, newPassword);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Password changed successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Create user response without password
     */
    private Map<String, Object> createUserResponse(User user) {
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("userID", user.getUserID());
        userMap.put("fullname", user.getFullname());
        userMap.put("email", user.getEmail());
        userMap.put("gender", user.getGender());
        userMap.put("phoneNumber", user.getPhoneNumber());
        userMap.put("age", user.getAge());
        userMap.put("address", user.getAddress());
        userMap.put("role", user.getRole().getRoleName());
        userMap.put("createDate", user.getCreateDate());
        return userMap;
    }
}

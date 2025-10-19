package com.example.travel.service;

import com.example.travel.dto.UserRegistrationDto;
import com.example.travel.entity.Role;
import com.example.travel.entity.User;
import com.example.travel.repository.RoleRepository;
import com.example.travel.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Register a new customer
     */
    @Transactional
    public User registerCustomer(UserRegistrationDto registrationDto) {
        // Check if email already exists
        if (userRepository.existsByEmail(registrationDto.getEmail())) {
            throw new RuntimeException("Email already registered: " + registrationDto.getEmail());
        }

        // Get Customer role
        Role customerRole = roleRepository.findByRoleName("Customer")
                .orElseThrow(() -> new RuntimeException("Customer role not found"));

        // Create new user
        User user = new User();
        user.setFullname(registrationDto.getFullname());
        user.setGender(registrationDto.getGender());
        user.setEmail(registrationDto.getEmail());
        user.setPasswordHash(passwordEncoder.encode(registrationDto.getPassword()));
        user.setPhoneNumber(registrationDto.getPhoneNumber());
        user.setAge(registrationDto.getAge());
        user.setAddress(registrationDto.getAddress());
        user.setRole(customerRole);
        user.setCreateDate(LocalDateTime.now());

        return userRepository.save(user);
    }

    /**
     * Authenticate user with email and password
     */
    public User authenticate(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        return user;
    }

    /**
     * Get user by ID
     */
    public User getUserById(Integer userID) {
        return userRepository.findById(userID)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userID));
    }

    /**
     * Get user by email
     */
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    /**
     * Get all users by role
     */
    public List<User> getUsersByRole(String roleName) {
        return userRepository.findByRole_RoleName(roleName);
    }

    /**
     * Check if user is admin
     */
    public boolean isAdmin(Integer userID) {
        User user = getUserById(userID);
        return "Admin".equals(user.getRole().getRoleName());
    }

    /**
     * Update user profile
     */
    @Transactional
    public User updateUser(Integer userID, UserRegistrationDto updateDto) {
        User user = getUserById(userID);
        
        if (updateDto.getFullname() != null) {
            user.setFullname(updateDto.getFullname());
        }
        if (updateDto.getGender() != null) {
            user.setGender(updateDto.getGender());
        }
        if (updateDto.getPhoneNumber() != null) {
            user.setPhoneNumber(updateDto.getPhoneNumber());
        }
        if (updateDto.getAge() != null) {
            user.setAge(updateDto.getAge());
        }
        if (updateDto.getAddress() != null) {
            user.setAddress(updateDto.getAddress());
        }
        
        return userRepository.save(user);
    }

    /**
     * Change user password
     */
    @Transactional
    public void changePassword(Integer userID, String oldPassword, String newPassword) {
        User user = getUserById(userID);
        
        if (!passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }
        
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}

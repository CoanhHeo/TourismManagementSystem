package com.example.travel.controller;

import com.example.travel.repository.BookingRepository;
import com.example.travel.repository.TourRepository;
import com.example.travel.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    
    @Autowired
    private TourRepository tourRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BookingRepository bookingRepository;

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
}

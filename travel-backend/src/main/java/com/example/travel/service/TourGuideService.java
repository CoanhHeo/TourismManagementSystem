package com.example.travel.service;

import com.example.travel.entity.TourDeparture;
import com.example.travel.entity.TourGuide;
import com.example.travel.entity.User;
import com.example.travel.repository.TourDepartureRepository;
import com.example.travel.repository.TourGuideRepository;
import com.example.travel.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service xử lý business logic cho Tour Guide (Hướng dẫn viên)
 * 
 * Chức năng chính:
 * - Lấy thông tin tour guide theo UserID
 * - Quản lý danh sách chuyến đi được phân công
 * - Lọc chuyến đi theo trạng thái (upcoming/current/active)
 * - Validate quyền truy cập tour guide
 * 
 * @author Tourism Management System
 * @version 1.0
 */
@Service
public class TourGuideService {

    @Autowired
    private TourGuideRepository tourGuideRepository;
    
    @Autowired
    private TourDepartureRepository tourDepartureRepository;
    
    @Autowired
    private UserRepository userRepository;

    /**
     * Lấy thông tin TourGuide theo UserID
     * 
     * @param userId ID của user cần tìm
     * @return TourGuide entity tương ứng
     * @throws RuntimeException nếu không tìm thấy tour guide
     */
    public TourGuide getTourGuideByUserId(Integer userId) {
        return tourGuideRepository.findByUser_UserID(userId)
                .orElseThrow(() -> new RuntimeException("Tour guide not found for user ID: " + userId));
    }

    /**
     * Lấy tất cả chuyến đi được phân công cho một tour guide
     * 
     * @param userId ID của tour guide
     * @return Danh sách TourDeparture được phân công
     */
    public List<TourDeparture> getAssignedDepartures(Integer userId) {
        TourGuide tourGuide = getTourGuideByUserId(userId);
        return tourDepartureRepository.findByTourGuide_TourGuideID(tourGuide.getTourGuideID());
    }

    /**
     * Lấy danh sách chuyến đi sắp diễn ra (chưa khởi hành)
     * 
     * Upcoming: departureTime >= currentTime
     * 
     * @param userId ID của tour guide
     * @return Danh sách TourDeparture sắp diễn ra
     */
    public List<TourDeparture> getUpcomingDepartures(Integer userId) {
        TourGuide tourGuide = getTourGuideByUserId(userId);
        LocalDateTime now = LocalDateTime.now();
        return tourDepartureRepository.findByTourGuide_TourGuideIDAndDepartureTimeGreaterThanEqual(
                tourGuide.getTourGuideID(), now);
    }

    /**
     * Lấy danh sách chuyến đi đang diễn ra
     * 
     * Current: departureTime <= currentTime <= returnTime
     * 
     * @param userId ID của tour guide
     * @return Danh sách TourDeparture đang diễn ra
     */
    public List<TourDeparture> getCurrentDepartures(Integer userId) {
        TourGuide tourGuide = getTourGuideByUserId(userId);
        LocalDateTime now = LocalDateTime.now();
        return tourDepartureRepository.findByTourGuide_TourGuideIDAndDepartureTimeLessThanEqualAndReturnTimeGreaterThanEqual(
                tourGuide.getTourGuideID(), now, now);
    }

    /**
     * Lấy tất cả chuyến đi đang active (upcoming + current)
     * 
     * Active: Chuyến đi chưa kết thúc (returnTime >= currentTime)
     * Sắp xếp theo thời gian khởi hành
     * 
     * @param userId ID của tour guide
     * @return Danh sách TourDeparture đang active
     */
    public List<TourDeparture> getActiveDepartures(Integer userId) {
        TourGuide tourGuide = getTourGuideByUserId(userId);
        LocalDateTime now = LocalDateTime.now();
        // Lấy các chuyến đi chưa kết thúc
        return tourDepartureRepository.findByTourGuide_TourGuideIDAndReturnTimeGreaterThanEqualOrderByDepartureTime(
                tourGuide.getTourGuideID(), now);
    }

    /**
     * Kiểm tra user có phải là tour guide không
     * 
     * Check role name = "Tour Guide" (RoleID = 3)
     * 
     * @param userId ID của user cần kiểm tra
     * @return true nếu là tour guide, false nếu không
     * @throws RuntimeException nếu không tìm thấy user
     */
    public boolean isTourGuide(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Kiểm tra user có role Tour Guide không (RoleID = 3)
        return "Tour Guide".equals(user.getRole().getRoleName());
    }

    /**
     * Validate quyền truy cập tour guide
     * 
     * Đảm bảo user đã authenticate và có role Tour Guide
     * Sử dụng trong controller để bảo vệ endpoints
     * 
     * @param userId ID của user cần validate
     * @throws RuntimeException nếu user không phải tour guide
     */
    public void validateTourGuideAccess(Integer userId) {
        if (!isTourGuide(userId)) {
            throw new RuntimeException("Access denied. User is not a tour guide.");
        }
    }
}
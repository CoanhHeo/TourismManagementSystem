package com.example.travel.controller;

import com.example.travel.dto.BookingResponseDto;
import com.example.travel.entity.TourDeparture;
import com.example.travel.service.BookingService;
import com.example.travel.service.TourGuideService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST Controller xử lý các request của Tour Guide (Hướng dẫn viên)
 * 
 * Base URL: /api/tour-guide
 * 
 * Endpoints:
 * - GET /api/tour-guide/my-departures              : Lấy danh sách chuyến đi được phân công
 * - GET /api/tour-guide/upcoming-departures        : Lấy chuyến đi sắp diễn ra
 * - GET /api/tour-guide/departure/{id}/passengers  : Lấy danh sách hành khách
 * 
 * Security: Validate user có role Tour Guide trước khi cho phép truy cập
 * 
 * @author Tourism Management System
 * @version 1.0
 */
@RestController
@RequestMapping("/api/tour-guide")
@CrossOrigin(origins = "http://localhost:4200")
public class TourGuideController {
    
    @Autowired
    private TourGuideService tourGuideService;
    
    @Autowired
    private BookingService bookingService;

    /**
     * Lấy tất cả chuyến đi được phân công cho tour guide đang đăng nhập
     * 
     * Endpoint: GET /api/tour-guide/my-departures
     * 
     * Trả về active departures (upcoming + current, chưa kết thúc)
     * 
     * @param userId ID của tour guide đang đăng nhập
     * @return List chuyến đi với thông tin tour, số hành khách, slots còn trống
     */
    @GetMapping("/my-departures")
    public ResponseEntity<?> getMyDepartures(@RequestParam Integer userId) {
        try {
            // Validate user có role Tour Guide không
            tourGuideService.validateTourGuideAccess(userId);
            
            // Lấy active departures (upcoming + current)
            List<TourDeparture> departures = tourGuideService.getActiveDepartures(userId);
            
            List<Map<String, Object>> response = departures.stream()
                .map(this::convertDepartureToMap)
                .collect(Collectors.toList());
                
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Lấy danh sách hành khách (bookings đã xác nhận) cho một chuyến đi cụ thể
     * 
     * Endpoint: GET /api/tour-guide/departure/{departureId}/passengers
     * 
     * Chỉ lấy bookings có status PAID (đã thanh toán)
     * 
     * @param departureId ID của chuyến đi
     * @param userId ID của tour guide
     * @return Danh sách passengers và tổng số hành khách
     */
    @GetMapping("/departure/{departureId}/passengers")
    public ResponseEntity<?> getPassengersByDeparture(
            @PathVariable Integer departureId,
            @RequestParam Integer userId) {
        try {
            // Validate user có role Tour Guide không
            tourGuideService.validateTourGuideAccess(userId);
            
            // Lấy danh sách hành khách đã xác nhận (PAID bookings only)
            List<BookingResponseDto> passengers = bookingService.getPassengersByDeparture(departureId);
            
            // Lấy tổng số hành khách
            Integer totalPassengers = bookingService.getTotalPassengerCount(departureId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("passengers", passengers);
            response.put("totalCount", totalPassengers);
            response.put("success", true);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Lấy danh sách chuyến đi sắp diễn ra (chưa khởi hành)
     * 
     * Endpoint: GET /api/tour-guide/upcoming-departures
     * 
     * Upcoming: departureTime >= currentTime
     * 
     * @param userId ID của tour guide
     * @return List chuyến đi sắp diễn ra
     */
    @GetMapping("/upcoming-departures")
    public ResponseEntity<?> getUpcomingDepartures(@RequestParam Integer userId) {
        try {
            tourGuideService.validateTourGuideAccess(userId);
            
            List<TourDeparture> departures = tourGuideService.getUpcomingDepartures(userId);
            
            List<Map<String, Object>> response = departures.stream()
                .map(this::convertDepartureToMap)
                .collect(Collectors.toList());
                
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Convert TourDeparture entity sang Map cho API response
     * 
     * Bao gồm thông tin:
     * - Departure details (ID, times, location, quantity)
     * - Tour info (name, destination, dayNum)
     * - Passenger stats (current, available slots)
     * 
     * @param departure TourDeparture cần convert
     * @return Map chứa đầy đủ thông tin
     */
    private Map<String, Object> convertDepartureToMap(TourDeparture departure) {
        Map<String, Object> map = new HashMap<>();
        map.put("tourDepartureID", departure.getTourDepartureID());
        map.put("tourID", departure.getTour().getTourID());
        map.put("tourName", departure.getTour().getTourName());
        map.put("touristDestination", departure.getTour().getTouristDestination());
        map.put("dayNum", departure.getDayNum());
        map.put("departureLocation", departure.getDepartureLocation());
        map.put("departureTime", departure.getDepartureTime());
        map.put("returnTime", departure.getReturnTime());
        map.put("maxQuantity", departure.getMaxQuantity());
        map.put("originalPrice", departure.getOriginalPrice());
        
        // Lấy số hành khách hiện tại
        Integer passengerCount = bookingService.getTotalPassengerCount(departure.getTourDepartureID());
        map.put("currentPassengers", passengerCount);
        map.put("availableSlots", departure.getMaxQuantity() - passengerCount);
        
        return map;
    }
}

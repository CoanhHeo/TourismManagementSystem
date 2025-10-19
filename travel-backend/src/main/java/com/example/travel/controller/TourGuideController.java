package com.example.travel.controller;

import com.example.travel.dto.BookingResponseDto;
import com.example.travel.entity.TourDeparture;
import com.example.travel.entity.TourGuide;
import com.example.travel.repository.TourGuideRepository;
import com.example.travel.service.BookingService;
import com.example.travel.service.TourGuideService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tour-guide")
@CrossOrigin(origins = "http://localhost:4200")
public class TourGuideController {

    @Autowired
    private TourGuideRepository tourGuideRepository;
    
    @Autowired
    private TourGuideService tourGuideService;
    
    @Autowired
    private BookingService bookingService;

    /**
     * 🎯 NEW: GET /api/tour-guide/my-departures
     * Get all departures assigned to the logged-in tour guide
     */
    @GetMapping("/my-departures")
    public ResponseEntity<?> getMyDepartures(@RequestParam Integer userId) {
        try {
            // Validate that user is a tour guide
            tourGuideService.validateTourGuideAccess(userId);
            
            // Get active departures (upcoming + current)
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
     * 🎯 NEW: GET /api/tour-guide/departure/{id}/passengers
     * Get all passengers (confirmed bookings) for a specific departure
     */
    @GetMapping("/departure/{departureId}/passengers")
    public ResponseEntity<?> getPassengersByDeparture(
            @PathVariable Integer departureId,
            @RequestParam Integer userId) {
        try {
            // Validate that user is a tour guide
            tourGuideService.validateTourGuideAccess(userId);
            
            // Get confirmed passengers (PAID bookings only)
            List<BookingResponseDto> passengers = bookingService.getPassengersByDeparture(departureId);
            
            // Get total passenger count
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
     * 🎯 NEW: GET /api/tour-guide/upcoming-departures
     * Get only upcoming departures (haven't started yet)
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
     * Convert TourDeparture entity to Map for API response
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
        
        // Get current passenger count
        Integer passengerCount = bookingService.getTotalPassengerCount(departure.getTourDepartureID());
        map.put("currentPassengers", passengerCount);
        map.put("availableSlots", departure.getMaxQuantity() - passengerCount);
        
        return map;
    }

    /**
     * Convert TourGuide entity to Map for API response
     */
    private Map<String, Object> convertToMap(TourGuide guide) {
        Map<String, Object> map = new HashMap<>();
        map.put("tourGuideID", guide.getTourGuideID());
        map.put("userID", guide.getUser().getUserID());
        map.put("fullname", guide.getUser().getFullname());
        map.put("email", guide.getUser().getEmail());
        map.put("phoneNumber", guide.getUser().getPhoneNumber());
        map.put("rating", guide.getRating());
        map.put("languages", guide.getLanguages());
        return map;
    }
}

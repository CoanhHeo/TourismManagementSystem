package com.example.travel.controller;

import com.example.travel.dto.TourWithPriceDTO;
import com.example.travel.entity.Tour;
import com.example.travel.repository.TourRepository;
import com.example.travel.repository.TourDepartureRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tours")
public class TourController {
    
    @Autowired
    private TourRepository tourRepository;
    
    @Autowired
    private TourDepartureRepository tourDepartureRepository;
    
    @Autowired
    private com.example.travel.repository.BookingRepository bookingRepository;

    /**
     * Get all tours with minimum prices from TourDeparture and booking counts
     * GET /api/tours
     */
    @GetMapping
    public ResponseEntity<List<TourWithPriceDTO>> getAllTours() {
        List<Tour> tours = tourRepository.findAll();
        List<TourWithPriceDTO> toursWithPrice = tours.stream()
                .map(tour -> {
                    Double minPrice = tourDepartureRepository.findMinPriceByTourId(tour.getTourID());
                    Integer bookingCount = bookingRepository.getTotalBookingsByTour(tour.getTourID());
                    return new TourWithPriceDTO(tour, minPrice, bookingCount);
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(toursWithPrice);
    }
    
    /**
     * Get tour by ID
     * GET /api/tours/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getTourById(@PathVariable Integer id) {
        try {
            Tour tour = tourRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Tour not found with ID: " + id));
            return ResponseEntity.ok(tour);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(404).body(error);
        }
    }

    /**
     * Get tours by type
     * GET /api/tours/type/{tourTypeID}
     */
    @GetMapping("/type/{tourTypeID}")
    public ResponseEntity<List<Tour>> getToursByType(@PathVariable Integer tourTypeID) {
        List<Tour> tours = tourRepository.findByTourType_TourTypeID(tourTypeID);
        return ResponseEntity.ok(tours);
    }

    /**
     * Search tours by destination
     * GET /api/tours/search/destination?q={keyword}
     */
    @GetMapping("/search/destination")
    public ResponseEntity<List<Tour>> searchByDestination(@RequestParam String q) {
        List<Tour> tours = tourRepository.findByTouristDestinationContainingIgnoreCase(q);
        return ResponseEntity.ok(tours);
    }

    /**
     * Search tours by keyword (name or description)
     * GET /api/tours/search?q={keyword}
     */
    @GetMapping("/search")
    public ResponseEntity<List<Tour>> searchTours(@RequestParam String q) {
        List<Tour> tours = tourRepository.searchTours(q);
        return ResponseEntity.ok(tours);
    }
    
    /**
     * Create a new tour (Admin only)
     * POST /api/tours
     * Note: Promotion is now a direct field in Tour entity
     * - 1 Promotion can be applied to MANY Tours
     * - 1 Tour can have ONLY 1 Promotion (or NULL)
     */
    @PostMapping
    public ResponseEntity<?> createTour(@RequestBody Map<String, Object> tourData) {
        try {
            // Create tour entity
            Tour tour = new Tour();
            tour.setTourName((String) tourData.get("tourName"));
            tour.setDescription((String) tourData.get("description"));
            tour.setTouristDestination((String) tourData.get("touristDestination"));
            
            // Set tour type
            if (tourData.containsKey("tourType")) {
                Map<String, Object> tourTypeData = (Map<String, Object>) tourData.get("tourType");
                if (tourTypeData != null && tourTypeData.containsKey("tourTypeID")) {
                    Integer tourTypeID = (Integer) tourTypeData.get("tourTypeID");
                    com.example.travel.entity.TourType tourType = new com.example.travel.entity.TourType(tourTypeID);
                    tour.setTourType(tourType);
                }
            }
            
            // ✅ ĐƠN GIẢN: Set promotion trực tiếp vào tour entity
            if (tourData.containsKey("promotion") && tourData.get("promotion") != null) {
                Map<String, Object> promotionData = (Map<String, Object>) tourData.get("promotion");
                if (promotionData.containsKey("promotionID")) {
                    Integer promotionID = (Integer) promotionData.get("promotionID");
                    com.example.travel.entity.Promotion promotion = new com.example.travel.entity.Promotion(promotionID);
                    tour.setPromotion(promotion);
                }
            }
            
            // Save tour (JPA tự động xử lý promotion)
            Tour savedTour = tourRepository.save(tour);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Tour created successfully");
            response.put("data", savedTour);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to create tour: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    /**
     * Update an existing tour (Admin only)
     * PUT /api/tours/{id}
     * 
     * Promotion Logic (SIMPLIFIED):
     * - 1 Promotion CÓ THỂ áp dụng cho NHIỀU Tours
     * - 1 Tour CHỈ CÓ 1 Promotion tại một thời điểm
     * - Khi update: Simply set tour.setPromotion(new) or tour.setPromotion(null)
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTour(@PathVariable Integer id, @RequestBody Map<String, Object> tourData) {
        try {
            Tour existingTour = tourRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Tour not found with ID: " + id));
            
            // Update basic fields
            if (tourData.containsKey("tourName")) {
                existingTour.setTourName((String) tourData.get("tourName"));
            }
            if (tourData.containsKey("description")) {
                existingTour.setDescription((String) tourData.get("description"));
            }
            if (tourData.containsKey("touristDestination")) {
                existingTour.setTouristDestination((String) tourData.get("touristDestination"));
            }
            if (tourData.containsKey("tourType")) {
                Map<String, Object> tourTypeData = (Map<String, Object>) tourData.get("tourType");
                if (tourTypeData != null && tourTypeData.containsKey("tourTypeID")) {
                    Integer tourTypeID = (Integer) tourTypeData.get("tourTypeID");
                    com.example.travel.entity.TourType tourType = new com.example.travel.entity.TourType(tourTypeID);
                    existingTour.setTourType(tourType);
                }
            }
            
            // ✅ ĐƠN GIẢN HÓA: Update promotion trực tiếp
            if (tourData.containsKey("promotion")) {
                Object promotionObj = tourData.get("promotion");
                
                if (promotionObj != null) {
                    // Set promotion mới
                    Map<String, Object> promotionData = (Map<String, Object>) promotionObj;
                    if (promotionData.containsKey("promotionID")) {
                        Integer promotionID = (Integer) promotionData.get("promotionID");
                        com.example.travel.entity.Promotion promotion = new com.example.travel.entity.Promotion(promotionID);
                        existingTour.setPromotion(promotion);
                    }
                } else {
                    // Set promotion = null (xóa promotion)
                    existingTour.setPromotion(null);
                }
            }
            
            // Save tour (JPA tự động update promotion)
            Tour updatedTour = tourRepository.save(existingTour);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Tour updated successfully");
            response.put("data", updatedTour);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to update tour: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    /**
     * Delete a tour (Admin only)
     * DELETE /api/tours/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTour(@PathVariable Integer id) {
        try {
            if (!tourRepository.existsById(id)) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Tour not found with ID: " + id);
                return ResponseEntity.status(404).body(error);
            }
            
            tourRepository.deleteById(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Tour deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to delete tour: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}

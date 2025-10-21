package com.example.travel.controller;

import com.example.travel.dto.TourDepartureDto;
import com.example.travel.entity.TourDeparture;
import com.example.travel.entity.TourGuide;
import com.example.travel.service.TourDepartureService;
import com.example.travel.repository.TourDepartureRepository;
import com.example.travel.repository.TourGuideRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tour-departures")
public class TourDepartureController {

    @Autowired
    private TourDepartureService tourDepartureService;
    
    @Autowired
    private TourDepartureRepository tourDepartureRepository;
    
    @Autowired
    private TourGuideRepository tourGuideRepository;

    /**
     * Get all tour departures (Admin only)
     * GET /api/tour-departures
     */
    @GetMapping
    public ResponseEntity<List<TourDepartureDto>> getAllDepartures() {
        List<TourDeparture> departures = tourDepartureRepository.findAll();
        List<TourDepartureDto> dtos = departures.stream()
                .map(d -> tourDepartureService.getDepartureWithAvailability(d.getTourDepartureID()))
                .toList();
        return ResponseEntity.ok(dtos);
    }

    /**
     * Get all upcoming departures
     * GET /api/tour-departures/upcoming
     */
    @GetMapping("/upcoming")
    public ResponseEntity<List<TourDepartureDto>> getUpcomingDepartures() {
        List<TourDepartureDto> departures = tourDepartureService.getUpcomingDepartures();
        return ResponseEntity.ok(departures);
    }

    /**
     * Get upcoming departures for a tour
     * GET /api/tour-departures/tour/{tourID}/upcoming
     */
    @GetMapping("/tour/{tourID}/upcoming")
    public ResponseEntity<List<TourDepartureDto>> getUpcomingDeparturesByTour(@PathVariable Integer tourID) {
        List<TourDepartureDto> departures = tourDepartureService.getUpcomingDeparturesByTour(tourID);
        return ResponseEntity.ok(departures);
    }

    /**
     * Get all departures for a tour
     * GET /api/tour-departures/tour/{tourID}
     */
    @GetMapping("/tour/{tourID}")
    public ResponseEntity<List<TourDepartureDto>> getDeparturesByTour(@PathVariable Integer tourID) {
        List<TourDepartureDto> departures = tourDepartureService.getDeparturesByTour(tourID);
        return ResponseEntity.ok(departures);
    }

    /**
     * Get departure by ID with availability
     * GET /api/tour-departures/{tourDepartureID}
     */
    @GetMapping("/{tourDepartureID}")
    public ResponseEntity<?> getDepartureById(@PathVariable Integer tourDepartureID) {
        try {
            TourDepartureDto departure = tourDepartureService.getDepartureWithAvailability(tourDepartureID);
            return ResponseEntity.ok(departure);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(404).body(error);
        }
    }

    /**
     * Check if departure has available slots
     * GET /api/tour-departures/{tourDepartureID}/check-availability
     */
    @GetMapping("/{tourDepartureID}/check-availability")
    public ResponseEntity<?> checkAvailability(
            @PathVariable Integer tourDepartureID,
            @RequestParam Integer quantity) {
        try {
            boolean available = tourDepartureService.hasAvailableSlots(tourDepartureID, quantity);
            Map<String, Object> response = new HashMap<>();
            response.put("tourDepartureID", tourDepartureID);
            response.put("requestedQuantity", quantity);
            response.put("available", available);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(404).body(error);
        }
    }
    
    /**
     * Create a new tour departure (Admin only)
     * POST /api/tour-departures
     * Body: { ...tourDeparture, guideId: 1 } (optional - single guide)
     */
    @PostMapping
    public ResponseEntity<?> createTourDeparture(@RequestBody Map<String, Object> payload) {
        try {
            // Extract tour departure data
            TourDeparture tourDeparture = new TourDeparture();
            tourDeparture.setDayNum((Integer) payload.get("dayNum"));
            tourDeparture.setOriginalPrice(new java.math.BigDecimal(payload.get("originalPrice").toString()));
            tourDeparture.setDepartureLocation((String) payload.get("departureLocation"));
            
            // Parse ISO 8601 DateTime (supports both with/without timezone)
            String departureTimeStr = (String) payload.get("departureTime");
            String returnTimeStr = (String) payload.get("returnTime");
            tourDeparture.setDepartureTime(parseDateTime(departureTimeStr));
            tourDeparture.setReturnTime(parseDateTime(returnTimeStr));
            
            tourDeparture.setMaxQuantity((Integer) payload.get("maxQuantity"));
            
            // Set Tour
            @SuppressWarnings("unchecked")
            Map<String, Object> tourMap = (Map<String, Object>) payload.get("tour");
            if (tourMap != null && tourMap.get("tourID") != null) {
                com.example.travel.entity.Tour tour = new com.example.travel.entity.Tour();
                tour.setTourID((Integer) tourMap.get("tourID"));
                tourDeparture.setTour(tour);
            }
            
            // 🎯 Assign single tour guide if provided
            Integer guideId = (Integer) payload.get("guideId");
            if (guideId != null) {
                try {
                    TourGuide guide = tourGuideRepository.findById(guideId).orElse(null);
                    if (guide == null) {
                        Map<String, Object> error = new HashMap<>();
                        error.put("success", false);
                        error.put("message", "Không tìm thấy hướng dẫn viên với ID: " + guideId);
                        return ResponseEntity.status(404).body(error);
                    }
                    
                    // ⚠️ CHECK DATE CONFLICT
                    List<TourDeparture> conflicts = tourDepartureRepository.findConflictingSchedules(
                        guideId,
                        tourDeparture.getDepartureTime(),
                        tourDeparture.getReturnTime()
                    );
                    
                    if (!conflicts.isEmpty()) {
                        TourDeparture conflict = conflicts.get(0);
                        Map<String, Object> error = new HashMap<>();
                        error.put("success", false);
                        error.put("message", String.format(
                            "Hướng dẫn viên này đã được phân công cho lịch trình khác (ID: %d) từ %s đến %s. Vui lòng chọn hướng dẫn viên khác hoặc thay đổi thời gian.",
                            conflict.getTourDepartureID(),
                            conflict.getDepartureTime().toLocalDate(),
                            conflict.getReturnTime().toLocalDate()
                        ));
                        error.put("conflictingDepartureId", conflict.getTourDepartureID());
                        return ResponseEntity.status(409).body(error); // 409 Conflict
                    }
                    
                    tourDeparture.setTourGuide(guide);
                } catch (Exception e) {
                    Map<String, Object> error = new HashMap<>();
                    error.put("success", false);
                    error.put("message", "Lỗi khi phân công hướng dẫn viên: " + e.getMessage());
                    return ResponseEntity.status(500).body(error);
                }
            }
            
            // Save departure with assigned guide
            TourDeparture savedDeparture = tourDepartureRepository.save(tourDeparture);
            
            TourDepartureDto dto = tourDepartureService.getDepartureWithAvailability(savedDeparture.getTourDepartureID());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", guideId != null 
                ? "Lịch khởi hành đã được tạo và phân công hướng dẫn viên thành công"
                : "Lịch khởi hành đã được tạo thành công");
            response.put("data", dto);
            response.put("assignedGuide", guideId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to create tour departure: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    /**
     * Update a tour departure (Admin only)
     * PUT /api/tour-departures/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTourDeparture(@PathVariable Integer id, @RequestBody TourDeparture tourDeparture) {
        try {
            TourDeparture existing = tourDepartureRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Tour departure not found with ID: " + id));
            
            // Update fields
            if (tourDeparture.getTour() != null) {
                existing.setTour(tourDeparture.getTour());
            }
            if (tourDeparture.getDayNum() != null) {
                existing.setDayNum(tourDeparture.getDayNum());
            }
            if (tourDeparture.getOriginalPrice() != null) {
                existing.setOriginalPrice(tourDeparture.getOriginalPrice());
            }
            if (tourDeparture.getDepartureLocation() != null) {
                existing.setDepartureLocation(tourDeparture.getDepartureLocation());
            }
            if (tourDeparture.getDepartureTime() != null) {
                existing.setDepartureTime(tourDeparture.getDepartureTime());
            }
            if (tourDeparture.getReturnTime() != null) {
                existing.setReturnTime(tourDeparture.getReturnTime());
            }
            if (tourDeparture.getMaxQuantity() != null) {
                existing.setMaxQuantity(tourDeparture.getMaxQuantity());
            }
            
            TourDeparture updatedDeparture = tourDepartureRepository.save(existing);
            TourDepartureDto dto = tourDepartureService.getDepartureWithAvailability(updatedDeparture.getTourDepartureID());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Tour departure updated successfully");
            response.put("data", dto);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to update tour departure: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    /**
     * Assign tour guide to departure
     * PUT /api/tour-departures/{id}/assign-guide/{guideId}
     */
    @PutMapping("/{id}/assign-guide/{guideId}")
    public ResponseEntity<?> assignTourGuide(@PathVariable Integer id, @PathVariable Integer guideId) {
        try {
            // Find departure
            TourDeparture departure = tourDepartureRepository.findById(id).orElse(null);
            if (departure == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Tour departure not found with ID: " + id);
                return ResponseEntity.status(404).body(error);
            }
            
            // Find guide
            TourGuide guide = tourGuideRepository.findById(guideId).orElse(null);
            if (guide == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Tour guide not found with ID: " + guideId);
                return ResponseEntity.status(404).body(error);
            }
            
            // ⚠️ CHECK DATE CONFLICT (exclude current departure)
            List<TourDeparture> conflicts = tourDepartureRepository.findConflictingSchedulesExcluding(
                guideId,
                id, // exclude this departure
                departure.getDepartureTime(),
                departure.getReturnTime()
            );
            
            if (!conflicts.isEmpty()) {
                TourDeparture conflict = conflicts.get(0);
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", String.format(
                    "Hướng dẫn viên này đã được phân công cho lịch trình khác (ID: %d) từ %s đến %s. Vui lòng chọn hướng dẫn viên khác.",
                    conflict.getTourDepartureID(),
                    conflict.getDepartureTime().toLocalDate(),
                    conflict.getReturnTime().toLocalDate()
                ));
                error.put("conflictingDepartureId", conflict.getTourDepartureID());
                return ResponseEntity.status(409).body(error); // 409 Conflict
            }
            
            // Assign guide directly
            departure.setTourGuide(guide);
            tourDepartureRepository.save(departure);
            
            TourDepartureDto dto = tourDepartureService.getDepartureWithAvailability(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Tour guide assigned successfully");
            response.put("data", dto);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to assign tour guide: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    /**
     * Delete a tour departure (Admin only)
     * DELETE /api/tour-departures/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTourDeparture(@PathVariable Integer id) {
        try {
            if (!tourDepartureRepository.existsById(id)) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Tour departure not found with ID: " + id);
                return ResponseEntity.status(404).body(error);
            }
            
            tourDepartureRepository.deleteById(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Tour departure deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to delete tour departure: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    /**
     * 🔧 Helper: Parse DateTime with multiple formats
     * Supports:
     * - ISO 8601 with timezone: "2025-10-19T20:35:00.000Z"
     * - ISO 8601 without timezone: "2025-10-19T20:35:00"
     * - Standard format: "2025-10-19T20:35"
     */
    private java.time.LocalDateTime parseDateTime(String dateTimeStr) {
        if (dateTimeStr == null || dateTimeStr.isEmpty()) {
            throw new IllegalArgumentException("DateTime string cannot be null or empty");
        }
        
        try {
            // Remove timezone indicator 'Z' and milliseconds if present
            // "2025-10-19T20:35:00.000Z" → "2025-10-19T20:35:00"
            String cleaned = dateTimeStr
                .replace("Z", "")
                .replaceAll("\\.\\d{3}$", ""); // Remove milliseconds at end
            
            return java.time.LocalDateTime.parse(cleaned);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid DateTime format: " + dateTimeStr + ". Expected ISO 8601 format.", e);
        }
    }
}

package com.example.travel.controller;

import com.example.travel.dto.TourDepartureDto;
import com.example.travel.entity.TourDeparture;
import com.example.travel.entity.TourDepartureTourGuide;
import com.example.travel.service.TourDepartureService;
import com.example.travel.repository.TourDepartureRepository;
import com.example.travel.repository.TourDepartureTourGuideRepository;
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
    private TourDepartureTourGuideRepository tourDepartureTourGuideRepository;

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
     */
    @PostMapping
    public ResponseEntity<?> createTourDeparture(@RequestBody TourDeparture tourDeparture) {
        try {
            TourDeparture savedDeparture = tourDepartureRepository.save(tourDeparture);
            TourDepartureDto dto = tourDepartureService.getDepartureWithAvailability(savedDeparture.getTourDepartureID());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Tour departure created successfully");
            response.put("data", dto);
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
            // Check if departure exists
            if (!tourDepartureRepository.existsById(id)) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Tour departure not found with ID: " + id);
                return ResponseEntity.status(404).body(error);
            }
            
            // Create assignment in junction table
            TourDepartureTourGuide assignment = new TourDepartureTourGuide(id, guideId);
            tourDepartureTourGuideRepository.save(assignment);
            
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
}

package com.example.travel.controller;

import com.example.travel.entity.TourGuide;
import com.example.travel.repository.TourGuideRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/tour-guides")
@CrossOrigin(origins = "http://localhost:4200")
public class AdminTourGuideController {

    @Autowired
    private TourGuideRepository tourGuideRepository;

    /**
     * GET /api/admin/tour-guides/active
     * Lấy tất cả tour guides active với role "Tour Guide"
     * Used by admin to assign guides to departures
     */
    @GetMapping("/active")
    public ResponseEntity<List<Map<String, Object>>> getActiveGuides() {
        List<TourGuide> guides = tourGuideRepository.findAllActiveGuides();
        
        List<Map<String, Object>> response = guides.stream()
            .map(this::convertToMap)
            .collect(Collectors.toList());
            
        return ResponseEntity.ok(response);
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
package com.example.travel.controller;

import com.example.travel.entity.Promotion;
import com.example.travel.repository.PromotionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/promotions")
public class PromotionController {

    @Autowired
    private PromotionRepository promotionRepository;

    /**
     * Get all promotions
     * GET /api/promotions
     */
    @GetMapping
    public ResponseEntity<List<Promotion>> getAllPromotions() {
        List<Promotion> promotions = promotionRepository.findAll();
        return ResponseEntity.ok(promotions);
    }

    /**
     * Get all active promotions (current date between start and end date)
     * GET /api/promotions/active
     */
    @GetMapping("/active")
    public ResponseEntity<List<Promotion>> getActivePromotions() {
        LocalDate now = LocalDate.now();
        List<Promotion> allPromotions = promotionRepository.findAll();
        
        List<Promotion> activePromotions = allPromotions.stream()
                .filter(p -> {
                    LocalDate start = p.getStartDate();
                    LocalDate end = p.getEndDate();
                    return start != null && end != null && 
                           !now.isBefore(start) && !now.isAfter(end);
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(activePromotions);
    }

    /**
     * Get promotion by ID
     * GET /api/promotions/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Promotion> getPromotionById(@PathVariable Integer id) {
        return promotionRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}

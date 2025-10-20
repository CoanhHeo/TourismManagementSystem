package com.example.travel.controller;

import com.example.travel.dto.PromotionDTO;
import com.example.travel.dto.PromotionStatsDTO;
import com.example.travel.service.PromotionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/promotions")
public class PromotionController {

    @Autowired
    private PromotionService promotionService;

    /**
     * Lấy tất cả khuyến mãi
     * GET /api/promotions
     */
    @GetMapping
    public ResponseEntity<List<PromotionDTO>> getAllPromotions() {
        try {
            List<PromotionDTO> promotions = promotionService.getAllPromotions();
            return ResponseEntity.ok(promotions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Lấy khuyến mãi theo ID
     * GET /api/promotions/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<PromotionDTO> getPromotionById(@PathVariable Integer id) {
        try {
            PromotionDTO promotion = promotionService.getPromotionById(id);
            return ResponseEntity.ok(promotion);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Lấy danh sách khuyến mãi đang active
     * GET /api/promotions/active
     */
    @GetMapping("/active")
    public ResponseEntity<List<PromotionDTO>> getActivePromotions() {
        try {
            List<PromotionDTO> promotions = promotionService.getActivePromotions();
            return ResponseEntity.ok(promotions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Lấy thống kê khuyến mãi
     * GET /api/promotions/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<PromotionStatsDTO> getPromotionStats() {
        try {
            PromotionStatsDTO stats = promotionService.getPromotionStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Tạo khuyến mãi mới
     * POST /api/promotions
     */
    @PostMapping
    public ResponseEntity<?> createPromotion(@RequestBody PromotionDTO promotionDTO) {
        try {
            PromotionDTO created = promotionService.createPromotion(promotionDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Cập nhật khuyến mãi
     * PUT /api/promotions/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePromotion(@PathVariable Integer id, @RequestBody PromotionDTO promotionDTO) {
        try {
            PromotionDTO updated = promotionService.updatePromotion(id, promotionDTO);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Xóa khuyến mãi
     * DELETE /api/promotions/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePromotion(@PathVariable Integer id) {
        try {
            promotionService.deletePromotion(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

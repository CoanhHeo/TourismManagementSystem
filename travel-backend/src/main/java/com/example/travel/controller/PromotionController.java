package com.example.travel.controller;

import com.example.travel.dto.PromotionDTO;
import com.example.travel.dto.PromotionStatsDTO;
import com.example.travel.service.PromotionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller xử lý các request liên quan đến Promotion (Khuyến mãi)
 * 
 * Base URL: /api/promotions
 * 
 * Endpoints:
 * - GET    /api/promotions          : Lấy tất cả khuyến mãi
 * - GET    /api/promotions/{id}     : Lấy khuyến mãi theo ID
 * - GET    /api/promotions/active   : Lấy khuyến mãi đang active
 * - GET    /api/promotions/stats    : Lấy thống kê khuyến mãi
 * - POST   /api/promotions          : Tạo khuyến mãi mới
 * - PUT    /api/promotions/{id}     : Cập nhật khuyến mãi
 * - DELETE /api/promotions/{id}     : Xóa khuyến mãi
 * 
 * HTTP Status Codes:
 * - 200 OK                : Request thành công
 * - 201 CREATED           : Tạo mới thành công
 * - 204 NO_CONTENT        : Xóa thành công (không trả về dữ liệu)
 * - 400 BAD_REQUEST       : Dữ liệu không hợp lệ (validation failed)
 * - 404 NOT_FOUND         : Không tìm thấy promotion
 * - 500 INTERNAL_ERROR    : Lỗi server
 * 
 * CORS được cấu hình global ở WebConfig (allowCredentials=true)
 * 
 * @author Tourism Management System
 * @version 1.0
 */
@RestController
@RequestMapping("/api/promotions")
public class PromotionController {

    @Autowired
    private PromotionService promotionService;

    /**
     * Lấy tất cả khuyến mãi
     * 
     * Endpoint: GET /api/promotions
     * 
     * @return ResponseEntity chứa danh sách PromotionDTO
     *         - 200 OK: Trả về List<PromotionDTO> (có thể rỗng)
     *         - 500 INTERNAL_SERVER_ERROR: Lỗi server
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
     * 
     * Endpoint: GET /api/promotions/{id}
     * 
     * @param id ID của khuyến mãi cần lấy
     * @return ResponseEntity chứa PromotionDTO
     *         - 200 OK: Trả về PromotionDTO tìm thấy
     *         - 404 NOT_FOUND: Không tìm thấy promotion với ID này
     *         - 500 INTERNAL_SERVER_ERROR: Lỗi server
     */
    @GetMapping("/{id}")
    public ResponseEntity<PromotionDTO> getPromotionById(@PathVariable Integer id) {
        try {
            PromotionDTO promotion = promotionService.getPromotionById(id);
            return ResponseEntity.ok(promotion);
        } catch (RuntimeException e) {
            // Service throw RuntimeException khi không tìm thấy
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Lấy danh sách khuyến mãi đang active
     * 
     * Endpoint: GET /api/promotions/active
     * 
     * Active promotion: Ngày hiện tại nằm trong khoảng [startDate, endDate]
     * 
     * @return ResponseEntity chứa danh sách PromotionDTO đang active
     *         - 200 OK: Trả về List<PromotionDTO> (có thể rỗng nếu không có active)
     *         - 500 INTERNAL_SERVER_ERROR: Lỗi server
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
     * 
     * Endpoint: GET /api/promotions/stats
     * 
     * Trả về 4 số liệu:
     * - total: Tổng số khuyến mãi
     * - active: Số khuyến mãi đang hoạt động
     * - expired: Số khuyến mãi đã hết hạn
     * - upcoming: Số khuyến mãi sắp diễn ra
     * 
     * @return ResponseEntity chứa PromotionStatsDTO
     *         - 200 OK: Trả về PromotionStatsDTO với 4 số liệu
     *         - 500 INTERNAL_SERVER_ERROR: Lỗi server
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
     * 
     * Endpoint: POST /api/promotions
     * 
     * Validation rules (xử lý ở Service layer):
     * - endDate >= startDate
     * - percent trong khoảng 1-100
     * 
     * Request body example:
     * {
     *   "promotionName": "Summer Sale",
     *   "percent": 20,
     *   "startDate": "2024-06-01",
     *   "endDate": "2024-08-31"
     * }
     * 
     * @param promotionDTO Thông tin khuyến mãi cần tạo
     * @return ResponseEntity chứa PromotionDTO hoặc error message
     *         - 201 CREATED: Tạo thành công, body chứa PromotionDTO
     *         - 400 BAD_REQUEST: Validation failed, body chứa error message
     *         - 500 INTERNAL_SERVER_ERROR: Lỗi server
     */
    @PostMapping
    public ResponseEntity<?> createPromotion(@RequestBody PromotionDTO promotionDTO) {
        try {
            PromotionDTO created = promotionService.createPromotion(promotionDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            // Validation error từ service
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Cập nhật khuyến mãi
     * 
     * Endpoint: PUT /api/promotions/{id}
     * 
     * Cập nhật tất cả các trường: promotionName, percent, startDate, endDate
     * Validation rules giống createPromotion
     * 
     * Request body example:
     * {
     *   "promotionName": "Summer Sale Extended",
     *   "percent": 25,
     *   "startDate": "2024-06-01",
     *   "endDate": "2024-09-30"
     * }
     * 
     * @param id ID của khuyến mãi cần cập nhật
     * @param promotionDTO Thông tin khuyến mãi mới
     * @return ResponseEntity chứa PromotionDTO hoặc error message
     *         - 200 OK: Cập nhật thành công, body chứa PromotionDTO
     *         - 400 BAD_REQUEST: Validation failed, body chứa error message
     *         - 500 INTERNAL_SERVER_ERROR: Lỗi server
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePromotion(@PathVariable Integer id, @RequestBody PromotionDTO promotionDTO) {
        try {
            PromotionDTO updated = promotionService.updatePromotion(id, promotionDTO);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            // Validation error hoặc not found từ service
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Xóa khuyến mãi
     * 
     * Endpoint: DELETE /api/promotions/{id}
     * 
     * Xóa vĩnh viễn khuyến mãi khỏi database
     * Kiểm tra tồn tại trước khi xóa
     * 
     * @param id ID của khuyến mãi cần xóa
     * @return ResponseEntity
     *         - 204 NO_CONTENT: Xóa thành công (không trả về body)
     *         - 404 NOT_FOUND: Không tìm thấy promotion, body chứa error message
     *         - 500 INTERNAL_SERVER_ERROR: Lỗi server
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePromotion(@PathVariable Integer id) {
        try {
            promotionService.deletePromotion(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            // Not found error từ service
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

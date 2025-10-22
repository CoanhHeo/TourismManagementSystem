package com.example.travel.controller;

import com.example.travel.entity.TourType;
import com.example.travel.service.TourTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller xử lý các API endpoints cho Tour Type
 * 
 * Base URL: /api/tour-types
 * 
 * Endpoints:
 * - GET    /           : Lấy tất cả loại tour
 * - GET    /{id}       : Lấy loại tour theo ID
 * - POST   /           : Tạo mới loại tour (Admin only)
 * - PUT    /{id}       : Cập nhật loại tour (Admin only)
 * - DELETE /{id}       : Xóa loại tour (Admin only)
 */
@RestController
@RequestMapping("/api/tour-types")
public class TourTypeController {

    @Autowired
    private TourTypeService tourTypeService;

    /**
     * Lấy tất cả loại tour
     * 
     * @return ResponseEntity<List<TourType>> danh sách loại tour
     * 
     * HTTP Status:
     * - 200 OK: Lấy dữ liệu thành công
     */
    @GetMapping
    public ResponseEntity<List<TourType>> getAllTourTypes() {
        List<TourType> tourTypes = tourTypeService.getAllTourTypes();
        return ResponseEntity.ok(tourTypes);
    }

    /**
     * Lấy loại tour theo ID
     * 
     * @param id ID của loại tour
     * @return ResponseEntity<TourType> thông tin loại tour
     * 
     * HTTP Status:
     * - 200 OK: Tìm thấy loại tour
     * - 404 Not Found: Không tìm thấy loại tour
     */
    @GetMapping("/{id}")
    public ResponseEntity<TourType> getTourTypeById(@PathVariable Integer id) {
        return tourTypeService.getTourTypeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Tạo mới loại tour
     * 
     * @param tourType Thông tin loại tour cần tạo
     * @return ResponseEntity<TourType> loại tour đã được tạo
     * 
     * Request Body:
     * {
     *   "tourTypeName": "Du lịch biển"
     * }
     * 
     * HTTP Status:
     * - 201 Created: Tạo thành công
     * - 400 Bad Request: Dữ liệu không hợp lệ
     */
    @PostMapping
    public ResponseEntity<?> createTourType(@RequestBody TourType tourType) {
        try {
            TourType createdTourType = tourTypeService.createTourType(tourType);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdTourType);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Cập nhật loại tour
     * 
     * @param id ID của loại tour cần cập nhật
     * @param tourType Thông tin mới của loại tour
     * @return ResponseEntity<TourType> loại tour đã được cập nhật
     * 
     * Request Body:
     * {
     *   "tourTypeName": "Du lịch núi non"
     * }
     * 
     * HTTP Status:
     * - 200 OK: Cập nhật thành công
     * - 400 Bad Request: Dữ liệu không hợp lệ
     * - 404 Not Found: Không tìm thấy loại tour
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTourType(@PathVariable Integer id, @RequestBody TourType tourType) {
        try {
            TourType updatedTourType = tourTypeService.updateTourType(id, tourType);
            return ResponseEntity.ok(updatedTourType);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Xóa loại tour
     * 
     * @param id ID của loại tour cần xóa
     * @return ResponseEntity<?> kết quả xóa
     * 
     * HTTP Status:
     * - 200 OK: Xóa thành công
     * - 400 Bad Request: Không thể xóa (đang được sử dụng)
     * - 404 Not Found: Không tìm thấy loại tour
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTourType(@PathVariable Integer id) {
        try {
            tourTypeService.deleteTourType(id);
            return ResponseEntity.ok("Xóa loại tour thành công");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

package com.example.travel.service;

import com.example.travel.dto.PromotionDTO;
import com.example.travel.dto.PromotionStatsDTO;
import com.example.travel.entity.Promotion;
import com.example.travel.repository.PromotionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service xử lý business logic cho Promotion (Khuyến mãi)
 * 
 * Chức năng chính:
 * - CRUD operations cho khuyến mãi
 * - Tính toán thống kê (tổng số, active, expired, upcoming)
 * - Validate dữ liệu (ngày tháng, phần trăm giảm giá)
 * - Convert giữa Entity và DTO
 * 
 * @author Tourism Management System
 * @version 1.0
 */
@Service
public class PromotionService {

    @Autowired
    private PromotionRepository promotionRepository;

    /**
     * Lấy tất cả khuyến mãi trong hệ thống
     * 
     * @return Danh sách PromotionDTO
     */
    public List<PromotionDTO> getAllPromotions() {
        return promotionRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy thông tin chi tiết một khuyến mãi theo ID
     * 
     * @param id ID của khuyến mãi
     * @return PromotionDTO
     * @throws RuntimeException nếu không tìm thấy khuyến mãi
     */
    public PromotionDTO getPromotionById(Integer id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promotion not found with ID: " + id));
        return convertToDTO(promotion);
    }

    /**
     * Lấy danh sách khuyến mãi đang active (trong khoảng thời gian hiện tại)
     * 
     * Active promotion: currentDate nằm giữa startDate và endDate
     * 
     * @return Danh sách PromotionDTO đang active
     */
    public List<PromotionDTO> getActivePromotions() {
        LocalDate currentDate = LocalDate.now();
        return promotionRepository.findActivePromotions(currentDate).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy thống kê khuyến mãi
     * 
     * Phân loại khuyến mãi theo trạng thái:
     * - Total: Tổng số tất cả khuyến mãi
     * - Active: Đang hoạt động (currentDate nằm trong khoảng startDate-endDate)
     * - Expired: Đã hết hạn (currentDate > endDate)
     * - Upcoming: Sắp diễn ra (currentDate < startDate)
     * 
     * @return PromotionStatsDTO chứa 4 số liệu thống kê
     */
    public PromotionStatsDTO getPromotionStats() {
        List<Promotion> allPromotions = promotionRepository.findAll();
        LocalDate currentDate = LocalDate.now();

        // Đếm tổng số khuyến mãi
        long total = allPromotions.size();
        
        // Đếm khuyến mãi đang active
        long active = allPromotions.stream()
                .filter(p -> !currentDate.isBefore(p.getStartDate()) && !currentDate.isAfter(p.getEndDate()))
                .count();
        
        // Đếm khuyến mãi đã hết hạn
        long expired = allPromotions.stream()
                .filter(p -> currentDate.isAfter(p.getEndDate()))
                .count();
        
        // Đếm khuyến mãi sắp diễn ra
        long upcoming = allPromotions.stream()
                .filter(p -> currentDate.isBefore(p.getStartDate()))
                .count();

        return new PromotionStatsDTO(
                (int) total,
                (int) active,
                (int) expired,
                (int) upcoming
        );
    }

    /**
     * Tạo khuyến mãi mới
     * 
     * Các quy tắc validate:
     * 1. endDate phải >= startDate
     * 2. percent phải trong khoảng 1-100
     * 
     * Sử dụng BigDecimal.compareTo() để so sánh decimal chính xác
     * 
     * @param promotionDTO Thông tin khuyến mãi cần tạo
     * @return PromotionDTO đã được lưu vào database
     * @throws RuntimeException nếu endDate < startDate hoặc percent không hợp lệ
     */
    @Transactional
    public PromotionDTO createPromotion(PromotionDTO promotionDTO) {
        // Validate: Ngày kết thúc phải >= ngày bắt đầu
        if (promotionDTO.getEndDate().isBefore(promotionDTO.getStartDate())) {
            throw new RuntimeException("End date must be after start date");
        }

        // Validate: Phần trăm giảm giá phải từ 1-100
        // Sử dụng compareTo() thay vì > < để so sánh BigDecimal chính xác
        if (promotionDTO.getPercent().compareTo(BigDecimal.ZERO) <= 0 || 
            promotionDTO.getPercent().compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new RuntimeException("Percent must be between 1 and 100");
        }

        Promotion promotion = convertToEntity(promotionDTO);
        Promotion savedPromotion = promotionRepository.save(promotion);
        return convertToDTO(savedPromotion);
    }

    /**
     * Cập nhật khuyến mãi
     * 
     * Kiểm tra tồn tại và validate dữ liệu tương tự createPromotion()
     * Cập nhật tất cả các trường: tên, phần trăm, ngày bắt đầu/kết thúc
     * 
     * @param id ID của khuyến mãi cần cập nhật
     * @param promotionDTO Thông tin khuyến mãi mới
     * @return PromotionDTO đã được cập nhật
     * @throws RuntimeException nếu không tìm thấy promotion hoặc dữ liệu không hợp lệ
     */
    @Transactional
    public PromotionDTO updatePromotion(Integer id, PromotionDTO promotionDTO) {
        // Kiểm tra khuyến mãi có tồn tại không
        Promotion existingPromotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promotion not found with ID: " + id));

        // Validate: Ngày kết thúc phải >= ngày bắt đầu
        if (promotionDTO.getEndDate().isBefore(promotionDTO.getStartDate())) {
            throw new RuntimeException("End date must be after start date");
        }

        // Validate: Phần trăm giảm giá phải từ 1-100
        if (promotionDTO.getPercent().compareTo(BigDecimal.ZERO) <= 0 || 
            promotionDTO.getPercent().compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new RuntimeException("Percent must be between 1 and 100");
        }

        // Cập nhật các trường
        existingPromotion.setPromotionName(promotionDTO.getPromotionName());
        existingPromotion.setPercent(promotionDTO.getPercent());
        existingPromotion.setStartDate(promotionDTO.getStartDate());
        existingPromotion.setEndDate(promotionDTO.getEndDate());

        Promotion updatedPromotion = promotionRepository.save(existingPromotion);
        return convertToDTO(updatedPromotion);
    }

    /**
     * Xóa khuyến mãi
     * 
     * Kiểm tra tồn tại trước khi xóa để tránh lỗi
     * 
     * @param id ID của khuyến mãi cần xóa
     * @throws RuntimeException nếu không tìm thấy promotion
     */
    @Transactional
    public void deletePromotion(Integer id) {
        // Kiểm tra khuyến mãi có tồn tại không
        if (!promotionRepository.existsById(id)) {
            throw new RuntimeException("Promotion not found with ID: " + id);
        }
        promotionRepository.deleteById(id);
    }

    /**
     * Convert Entity sang DTO
     * 
     * Map tất cả các trường từ Promotion entity sang PromotionDTO
     * Sử dụng để trả về dữ liệu cho client (tránh expose entity trực tiếp)
     * 
     * @param promotion Entity cần convert
     * @return PromotionDTO tương ứng
     */
    private PromotionDTO convertToDTO(Promotion promotion) {
        PromotionDTO dto = new PromotionDTO();
        dto.setPromotionID(promotion.getPromotionID());
        dto.setPromotionName(promotion.getPromotionName());
        dto.setPercent(promotion.getPercent());
        dto.setStartDate(promotion.getStartDate());
        dto.setEndDate(promotion.getEndDate());
        return dto;
    }

    /**
     * Convert DTO sang Entity
     * 
     * Map dữ liệu từ PromotionDTO sang Promotion entity để lưu vào database
     * Chỉ set PromotionID nếu dto có ID (trường hợp update, không phải create mới)
     * 
     * @param dto DTO cần convert
     * @return Promotion entity tương ứng
     */
    private Promotion convertToEntity(PromotionDTO dto) {
        Promotion promotion = new Promotion();
        // Chỉ set ID nếu dto có ID (update case)
        if (dto.getPromotionID() != null) {
            promotion.setPromotionID(dto.getPromotionID());
        }
        promotion.setPromotionName(dto.getPromotionName());
        promotion.setPercent(dto.getPercent());
        promotion.setStartDate(dto.getStartDate());
        promotion.setEndDate(dto.getEndDate());
        return promotion;
    }
}

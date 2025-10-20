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

@Service
public class PromotionService {

    @Autowired
    private PromotionRepository promotionRepository;

    /**
     * Lấy tất cả khuyến mãi
     */
    public List<PromotionDTO> getAllPromotions() {
        return promotionRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy khuyến mãi theo ID
     */
    public PromotionDTO getPromotionById(Integer id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promotion not found with ID: " + id));
        return convertToDTO(promotion);
    }

    /**
     * Lấy danh sách khuyến mãi đang active
     */
    public List<PromotionDTO> getActivePromotions() {
        LocalDate currentDate = LocalDate.now();
        return promotionRepository.findActivePromotions(currentDate).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy thống kê khuyến mãi
     */
    public PromotionStatsDTO getPromotionStats() {
        List<Promotion> allPromotions = promotionRepository.findAll();
        LocalDate currentDate = LocalDate.now();

        long total = allPromotions.size();
        long active = allPromotions.stream()
                .filter(p -> !currentDate.isBefore(p.getStartDate()) && !currentDate.isAfter(p.getEndDate()))
                .count();
        long expired = allPromotions.stream()
                .filter(p -> currentDate.isAfter(p.getEndDate()))
                .count();
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
     */
    @Transactional
    public PromotionDTO createPromotion(PromotionDTO promotionDTO) {
        // Validate dates
        if (promotionDTO.getEndDate().isBefore(promotionDTO.getStartDate())) {
            throw new RuntimeException("End date must be after start date");
        }

        // Validate percent
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
     */
    @Transactional
    public PromotionDTO updatePromotion(Integer id, PromotionDTO promotionDTO) {
        Promotion existingPromotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promotion not found with ID: " + id));

        // Validate dates
        if (promotionDTO.getEndDate().isBefore(promotionDTO.getStartDate())) {
            throw new RuntimeException("End date must be after start date");
        }

        // Validate percent
        if (promotionDTO.getPercent().compareTo(BigDecimal.ZERO) <= 0 || 
            promotionDTO.getPercent().compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new RuntimeException("Percent must be between 1 and 100");
        }

        existingPromotion.setPromotionName(promotionDTO.getPromotionName());
        existingPromotion.setPercent(promotionDTO.getPercent());
        existingPromotion.setStartDate(promotionDTO.getStartDate());
        existingPromotion.setEndDate(promotionDTO.getEndDate());

        Promotion updatedPromotion = promotionRepository.save(existingPromotion);
        return convertToDTO(updatedPromotion);
    }

    /**
     * Xóa khuyến mãi
     */
    @Transactional
    public void deletePromotion(Integer id) {
        if (!promotionRepository.existsById(id)) {
            throw new RuntimeException("Promotion not found with ID: " + id);
        }
        promotionRepository.deleteById(id);
    }

    /**
     * Convert Entity to DTO
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
     * Convert DTO to Entity
     */
    private Promotion convertToEntity(PromotionDTO dto) {
        Promotion promotion = new Promotion();
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

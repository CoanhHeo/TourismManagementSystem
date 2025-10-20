package com.example.travel.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class PromotionDTO {
    private Integer promotionID;
    private String promotionName;
    private BigDecimal percent;
    private LocalDate startDate;
    private LocalDate endDate;

    // Constructors
    public PromotionDTO() {
    }

    public PromotionDTO(Integer promotionID, String promotionName, BigDecimal percent, 
                       LocalDate startDate, LocalDate endDate) {
        this.promotionID = promotionID;
        this.promotionName = promotionName;
        this.percent = percent;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    // Getters and Setters
    public Integer getPromotionID() {
        return promotionID;
    }

    public void setPromotionID(Integer promotionID) {
        this.promotionID = promotionID;
    }

    public String getPromotionName() {
        return promotionName;
    }

    public void setPromotionName(String promotionName) {
        this.promotionName = promotionName;
    }

    public BigDecimal getPercent() {
        return percent;
    }

    public void setPercent(BigDecimal percent) {
        this.percent = percent;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }
}

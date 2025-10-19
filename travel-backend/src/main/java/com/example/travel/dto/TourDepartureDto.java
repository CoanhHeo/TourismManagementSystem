package com.example.travel.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TourDepartureDto {
    private Integer tourDepartureID;
    private Integer tourID;
    private String tourName;
    private String touristDestination;
    private Integer dayNum;
    private BigDecimal originalPrice;
    private String departureLocation;
    private LocalDateTime departureTime;
    private LocalDateTime returnTime;
    private Integer maxQuantity;
    private Integer availableSlots;
    private PromotionDto promotion; // Add promotion information
    private TourGuideDto tourGuide; // 🎯 Add tour guide information

    // Inner DTO class for TourGuide
    public static class TourGuideDto {
        private Integer tourGuideID;
        private Integer userID;
        private String fullname;
        private String email;
        private Double rating;
        private String languages;

        public TourGuideDto() {}

        public Integer getTourGuideID() { return tourGuideID; }
        public void setTourGuideID(Integer tourGuideID) { this.tourGuideID = tourGuideID; }

        public Integer getUserID() { return userID; }
        public void setUserID(Integer userID) { this.userID = userID; }

        public String getFullname() { return fullname; }
        public void setFullname(String fullname) { this.fullname = fullname; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public Double getRating() { return rating; }
        public void setRating(Double rating) { this.rating = rating; }

        public String getLanguages() { return languages; }
        public void setLanguages(String languages) { this.languages = languages; }
    }

    // Constructors
    public TourDepartureDto() {
    }

    // Getters and Setters
    public Integer getTourDepartureID() {
        return tourDepartureID;
    }

    public void setTourDepartureID(Integer tourDepartureID) {
        this.tourDepartureID = tourDepartureID;
    }

    public Integer getTourID() {
        return tourID;
    }

    public void setTourID(Integer tourID) {
        this.tourID = tourID;
    }

    public String getTourName() {
        return tourName;
    }

    public void setTourName(String tourName) {
        this.tourName = tourName;
    }

    public String getTouristDestination() {
        return touristDestination;
    }

    public void setTouristDestination(String touristDestination) {
        this.touristDestination = touristDestination;
    }

    public Integer getDayNum() {
        return dayNum;
    }

    public void setDayNum(Integer dayNum) {
        this.dayNum = dayNum;
    }

    public BigDecimal getOriginalPrice() {
        return originalPrice;
    }

    public void setOriginalPrice(BigDecimal originalPrice) {
        this.originalPrice = originalPrice;
    }

    public String getDepartureLocation() {
        return departureLocation;
    }

    public void setDepartureLocation(String departureLocation) {
        this.departureLocation = departureLocation;
    }

    public LocalDateTime getDepartureTime() {
        return departureTime;
    }

    public void setDepartureTime(LocalDateTime departureTime) {
        this.departureTime = departureTime;
    }

    public LocalDateTime getReturnTime() {
        return returnTime;
    }

    public void setReturnTime(LocalDateTime returnTime) {
        this.returnTime = returnTime;
    }

    public Integer getMaxQuantity() {
        return maxQuantity;
    }

    public void setMaxQuantity(Integer maxQuantity) {
        this.maxQuantity = maxQuantity;
    }

    public Integer getAvailableSlots() {
        return availableSlots;
    }

    public void setAvailableSlots(Integer availableSlots) {
        this.availableSlots = availableSlots;
    }

    public PromotionDto getPromotion() {
        return promotion;
    }

    public void setPromotion(PromotionDto promotion) {
        this.promotion = promotion;
    }

    public TourGuideDto getTourGuide() {
        return tourGuide;
    }

    public void setTourGuide(TourGuideDto tourGuide) {
        this.tourGuide = tourGuide;
    }
}

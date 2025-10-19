package com.example.travel.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BookingResponseDto {
    private Integer bookingID;
    private Integer userID;
    private String userFullname;
    private String email;
    private String phoneNumber;
    private Integer tourDepartureID;
    private String tourName;
    private Integer quantity;
    private BigDecimal originalPrice;
    private BigDecimal discountAmount;
    private BigDecimal totalPayment;
    private String paymentStatus;
    private LocalDateTime bookingDate;
    private LocalDateTime departureTime;
    
    // Tour Guide information
    private String guideFullname;
    private Double guideRating;
    private String guideLanguages;

    // Constructors
    public BookingResponseDto() {
    }

    // Getters and Setters
    public Integer getBookingID() {
        return bookingID;
    }

    public void setBookingID(Integer bookingID) {
        this.bookingID = bookingID;
    }

    public Integer getUserID() {
        return userID;
    }

    public void setUserID(Integer userID) {
        this.userID = userID;
    }

    public String getUserFullname() {
        return userFullname;
    }

    public void setUserFullname(String userFullname) {
        this.userFullname = userFullname;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public Integer getTourDepartureID() {
        return tourDepartureID;
    }

    public void setTourDepartureID(Integer tourDepartureID) {
        this.tourDepartureID = tourDepartureID;
    }

    public String getTourName() {
        return tourName;
    }

    public void setTourName(String tourName) {
        this.tourName = tourName;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getOriginalPrice() {
        return originalPrice;
    }

    public void setOriginalPrice(BigDecimal originalPrice) {
        this.originalPrice = originalPrice;
    }

    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(BigDecimal discountAmount) {
        this.discountAmount = discountAmount;
    }

    public BigDecimal getTotalPayment() {
        return totalPayment;
    }

    public void setTotalPayment(BigDecimal totalPayment) {
        this.totalPayment = totalPayment;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public LocalDateTime getBookingDate() {
        return bookingDate;
    }

    public void setBookingDate(LocalDateTime bookingDate) {
        this.bookingDate = bookingDate;
    }

    public LocalDateTime getDepartureTime() {
        return departureTime;
    }

    public void setDepartureTime(LocalDateTime departureTime) {
        this.departureTime = departureTime;
    }

    public String getGuideFullname() {
        return guideFullname;
    }

    public void setGuideFullname(String guideFullname) {
        this.guideFullname = guideFullname;
    }

    public Double getGuideRating() {
        return guideRating;
    }

    public void setGuideRating(Double guideRating) {
        this.guideRating = guideRating;
    }

    public String getGuideLanguages() {
        return guideLanguages;
    }

    public void setGuideLanguages(String guideLanguages) {
        this.guideLanguages = guideLanguages;
    }
}

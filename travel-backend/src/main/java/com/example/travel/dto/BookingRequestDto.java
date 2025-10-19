package com.example.travel.dto;

public class BookingRequestDto {
    private Integer userID;
    private Integer tourDepartureID;
    private Integer promotionID;
    private Integer quantity;

    // Constructors
    public BookingRequestDto() {
    }

    public BookingRequestDto(Integer userID, Integer tourDepartureID, Integer promotionID, Integer quantity) {
        this.userID = userID;
        this.tourDepartureID = tourDepartureID;
        this.promotionID = promotionID;
        this.quantity = quantity;
    }

    // Getters and Setters
    public Integer getUserID() {
        return userID;
    }

    public void setUserID(Integer userID) {
        this.userID = userID;
    }

    public Integer getTourDepartureID() {
        return tourDepartureID;
    }

    public void setTourDepartureID(Integer tourDepartureID) {
        this.tourDepartureID = tourDepartureID;
    }

    public Integer getPromotionID() {
        return promotionID;
    }

    public void setPromotionID(Integer promotionID) {
        this.promotionID = promotionID;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}

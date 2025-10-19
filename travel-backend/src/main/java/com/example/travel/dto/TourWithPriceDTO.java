package com.example.travel.dto;

import com.example.travel.entity.Tour;
import com.example.travel.entity.TourType;
import com.example.travel.entity.Promotion;

/**
 * DTO for Tour with calculated minimum price from TourDeparture
 */
public class TourWithPriceDTO {
    private Integer tourID;
    private String tourName;
    private String description;
    private String touristDestination;
    private TourType tourType;
    private Promotion promotion;  // Promotion applied to this tour
    private Double originalPrice;  // Minimum price from TourDeparture
    private Integer totalBookings;  // Total number of bookings for this tour

    public TourWithPriceDTO() {
    }

    public TourWithPriceDTO(Tour tour, Double minPrice) {
        this.tourID = tour.getTourID();
        this.tourName = tour.getTourName();
        this.description = tour.getDescription();
        this.touristDestination = tour.getTouristDestination();
        this.tourType = tour.getTourType();
        this.promotion = tour.getPromotion();
        this.originalPrice = minPrice;
        this.totalBookings = 0;
    }
    
    public TourWithPriceDTO(Tour tour, Double minPrice, Integer totalBookings) {
        this.tourID = tour.getTourID();
        this.tourName = tour.getTourName();
        this.description = tour.getDescription();
        this.touristDestination = tour.getTouristDestination();
        this.tourType = tour.getTourType();
        this.promotion = tour.getPromotion();
        this.originalPrice = minPrice;
        this.totalBookings = totalBookings != null ? totalBookings : 0;
    }

    // Getters and Setters
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTouristDestination() {
        return touristDestination;
    }

    public void setTouristDestination(String touristDestination) {
        this.touristDestination = touristDestination;
    }

    public TourType getTourType() {
        return tourType;
    }

    public void setTourType(TourType tourType) {
        this.tourType = tourType;
    }

    public Promotion getPromotion() {
        return promotion;
    }

    public void setPromotion(Promotion promotion) {
        this.promotion = promotion;
    }

    public Double getOriginalPrice() {
        return originalPrice;
    }

    public void setOriginalPrice(Double originalPrice) {
        this.originalPrice = originalPrice;
    }

    public Integer getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(Integer totalBookings) {
        this.totalBookings = totalBookings;
    }
}

package com.example.travel.entity;

import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "TourDeparture_TourGuide")
@IdClass(TourDepartureTourGuideId.class)
public class TourDepartureTourGuide implements Serializable {
    
    @Id
    @Column(name = "TourDepartureID")
    private Integer tourDepartureID;
    
    @Id
    @Column(name = "TourGuideID")
    private Integer tourGuideID;
    
    // Constructors
    public TourDepartureTourGuide() {
    }
    
    public TourDepartureTourGuide(Integer tourDepartureID, Integer tourGuideID) {
        this.tourDepartureID = tourDepartureID;
        this.tourGuideID = tourGuideID;
    }
    
    // Getters and Setters
    public Integer getTourDepartureID() {
        return tourDepartureID;
    }
    
    public void setTourDepartureID(Integer tourDepartureID) {
        this.tourDepartureID = tourDepartureID;
    }
    
    public Integer getTourGuideID() {
        return tourGuideID;
    }
    
    public void setTourGuideID(Integer tourGuideID) {
        this.tourGuideID = tourGuideID;
    }
}

// Composite Key Class
class TourDepartureTourGuideId implements Serializable {
    private Integer tourDepartureID;
    private Integer tourGuideID;
    
    public TourDepartureTourGuideId() {
    }
    
    public TourDepartureTourGuideId(Integer tourDepartureID, Integer tourGuideID) {
        this.tourDepartureID = tourDepartureID;
        this.tourGuideID = tourGuideID;
    }
    
    // Getters, Setters, equals() and hashCode()
    public Integer getTourDepartureID() {
        return tourDepartureID;
    }
    
    public void setTourDepartureID(Integer tourDepartureID) {
        this.tourDepartureID = tourDepartureID;
    }
    
    public Integer getTourGuideID() {
        return tourGuideID;
    }
    
    public void setTourGuideID(Integer tourGuideID) {
        this.tourGuideID = tourGuideID;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TourDepartureTourGuideId that = (TourDepartureTourGuideId) o;
        return tourDepartureID.equals(that.tourDepartureID) && tourGuideID.equals(that.tourGuideID);
    }
    
    @Override
    public int hashCode() {
        return tourDepartureID.hashCode() + tourGuideID.hashCode();
    }
}

package com.example.travel.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "Tours")
public class Tour {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "TourID")
    private Integer tourID;

    @Column(name = "TourName", length = 50)
    private String tourName;

    @Column(name = "Description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "TouristDestination", nullable = false, length = 120)
    private String touristDestination;

    @ManyToOne
    @JoinColumn(name = "TourTypesID", nullable = false)
    private TourType tourType;

    // Constructors
    public Tour() {
    }

    public Tour(Integer tourID) {
        this.tourID = tourID;
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
}

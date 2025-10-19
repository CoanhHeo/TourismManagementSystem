package com.example.travel.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "TourTypes")
public class TourType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "TourTypeID")
    private Integer tourTypeID;

    @Column(name = "TourTypeName", length = 50)
    private String tourTypeName;

    // Constructors
    public TourType() {
    }

    public TourType(Integer tourTypeID) {
        this.tourTypeID = tourTypeID;
    }

    public TourType(Integer tourTypeID, String tourTypeName) {
        this.tourTypeID = tourTypeID;
        this.tourTypeName = tourTypeName;
    }

    // Getters and Setters
    public Integer getTourTypeID() {
        return tourTypeID;
    }

    public void setTourTypeID(Integer tourTypeID) {
        this.tourTypeID = tourTypeID;
    }

    public String getTourTypeName() {
        return tourTypeName;
    }

    public void setTourTypeName(String tourTypeName) {
        this.tourTypeName = tourTypeName;
    }
}

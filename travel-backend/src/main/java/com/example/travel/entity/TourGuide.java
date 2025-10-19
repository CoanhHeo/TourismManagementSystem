package com.example.travel.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "TourGuide")
public class TourGuide {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "TourGuideID")
    private Integer tourGuideID;

    @OneToOne
    @JoinColumn(name = "UserID", nullable = false, unique = true)
    private User user;

    @Column(name = "Rating", precision = 3, scale = 2)
    private BigDecimal rating;

    @Column(name = "Languages", length = 200)
    private String languages;

    // Constructors
    public TourGuide() {
    }

    public TourGuide(Integer tourGuideID) {
        this.tourGuideID = tourGuideID;
    }

    // Getters and Setters
    public Integer getTourGuideID() {
        return tourGuideID;
    }

    public void setTourGuideID(Integer tourGuideID) {
        this.tourGuideID = tourGuideID;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public BigDecimal getRating() {
        return rating;
    }

    public void setRating(BigDecimal rating) {
        this.rating = rating;
    }

    public String getLanguages() {
        return languages;
    }

    public void setLanguages(String languages) {
        this.languages = languages;
    }
}

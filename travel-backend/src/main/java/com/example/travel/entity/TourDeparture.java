package com.example.travel.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "TourDeparture")
public class TourDeparture {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "TourDepartureID")
    private Integer tourDepartureID;

    @ManyToOne
    @JoinColumn(name = "TourID", nullable = false)
    private Tour tour;

    @Column(name = "DayNum", nullable = false)
    private Integer dayNum;

    @Column(name = "OriginalPrice", nullable = false, precision = 18, scale = 2)
    private BigDecimal originalPrice;

    @Column(name = "DepartureLocation", length = 50)
    private String departureLocation;

    @Column(name = "DepartureTime", nullable = false)
    private LocalDateTime departureTime;

    @Column(name = "ReturnTime", nullable = false)
    private LocalDateTime returnTime;

    @Column(name = "DateCreated")
    private LocalDate dateCreated;

    @Column(name = "MaxQuantity", nullable = false)
    private Integer maxQuantity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TourGuideID", nullable = true) // nullable - guide assignment is optional
    private TourGuide tourGuide;

    // PrePersist: gọi phương thức này trước khi entity được lưu lần đầu tiên vào database -> thiết lập giá trị mặc định cho trường dateCreated
    @PrePersist
    protected void onCreate() {
        if (this.dateCreated == null) {
            this.dateCreated = LocalDate.now();
        }
    }

    // Constructors
    public TourDeparture() {
    }

    public TourDeparture(Integer tourDepartureID) {
        this.tourDepartureID = tourDepartureID;
    }

    // Getters and Setters
    public Integer getTourDepartureID() {
        return tourDepartureID;
    }

    public void setTourDepartureID(Integer tourDepartureID) {
        this.tourDepartureID = tourDepartureID;
    }

    public Tour getTour() {
        return tour;
    }

    public void setTour(Tour tour) {
        this.tour = tour;
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

    public LocalDate getDateCreated() {
        return dateCreated;
    }

    public void setDateCreated(LocalDate dateCreated) {
        this.dateCreated = dateCreated;
    }

    public Integer getMaxQuantity() {
        return maxQuantity;
    }

    public void setMaxQuantity(Integer maxQuantity) {
        this.maxQuantity = maxQuantity;
    }

    public TourGuide getTourGuide() {
        return tourGuide;
    }

    public void setTourGuide(TourGuide tourGuide) {
        this.tourGuide = tourGuide;
    }
}

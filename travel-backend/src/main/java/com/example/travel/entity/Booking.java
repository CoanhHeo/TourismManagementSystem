package com.example.travel.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "Booking")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BookingID")
    private Integer bookingID;

    @ManyToOne
    @JoinColumn(name = "UserID", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "TourDepartureID", nullable = false)
    private TourDeparture tourDeparture;

    @ManyToOne
    @JoinColumn(name = "PromotionID")
    private Promotion promotion;

    @Column(name = "Quantity", nullable = false)
    private Integer quantity;

    @Column(name = "OriginalPrice", nullable = false, precision = 18, scale = 2)
    private BigDecimal originalPrice;

    @Column(name = "DiscountAmount", nullable = false, precision = 18, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    // TotalPayment is computed column in database, so we make it insertable=false, updatable=false
    @Column(name = "TotalPayment", precision = 18, scale = 2, insertable = false, updatable = false)
    private BigDecimal totalPayment;

    @Column(name = "PaymentStatus", nullable = false, length = 20)
    private String paymentStatus = "PENDING"; // PENDING, PAID, CANCELLED

    @Column(name = "BookingDate", nullable = false)
    private LocalDateTime bookingDate;

    // Constructors
    public Booking() {
        this.bookingDate = LocalDateTime.now();
        this.discountAmount = BigDecimal.ZERO;
        this.paymentStatus = "PENDING";
    }

    // Getters and Setters
    public Integer getBookingID() {
        return bookingID;
    }

    public void setBookingID(Integer bookingID) {
        this.bookingID = bookingID;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public TourDeparture getTourDeparture() {
        return tourDeparture;
    }

    public void setTourDeparture(TourDeparture tourDeparture) {
        this.tourDeparture = tourDeparture;
    }

    public Promotion getPromotion() {
        return promotion;
    }

    public void setPromotion(Promotion promotion) {
        this.promotion = promotion;
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
}

package com.example.travel.repository;

import com.example.travel.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {
    List<Booking> findByUser_UserID(Integer userID);
    
    List<Booking> findByTourDeparture_TourDepartureID(Integer tourDepartureID);
    
    @Query("SELECT b FROM Booking b WHERE b.user.userID = :userID AND b.paymentStatus IN ('PENDING', 'PAID') ORDER BY b.bookingDate DESC")
    List<Booking> findActiveBookingsByUser(@Param("userID") Integer userID);
    
    @Query("SELECT COALESCE(SUM(b.quantity), 0) FROM Booking b " +
           "WHERE b.tourDeparture.tourDepartureID = :tourDepartureID AND b.paymentStatus IN ('PENDING', 'PAID')")
    Integer getTotalBookedQuantity(@Param("tourDepartureID") Integer tourDepartureID);
    
    @Query("SELECT COALESCE(SUM(b.quantity), 0) FROM Booking b " +
           "WHERE b.tourDeparture.tour.tourID = :tourID AND b.paymentStatus IN ('PENDING', 'PAID')")
    Integer getTotalBookingsByTour(@Param("tourID") Integer tourID);
    
    @Query("SELECT COALESCE(SUM(b.totalPayment), 0.0) FROM Booking b WHERE b.paymentStatus = 'PAID'")
    Double calculateTotalRevenue();
    
    long countByPaymentStatus(String paymentStatus);
}

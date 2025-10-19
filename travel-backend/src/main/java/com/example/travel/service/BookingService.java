package com.example.travel.service;

import com.example.travel.dto.BookingRequestDto;
import com.example.travel.dto.BookingResponseDto;
import com.example.travel.entity.Booking;
import com.example.travel.entity.TourDeparture;
import com.example.travel.repository.BookingRepository;
import com.example.travel.repository.TourDepartureRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Types;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private TourDepartureRepository tourDepartureRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Create a booking using the stored procedure usp_AddBooking
     */
    @Transactional
    public Integer createBooking(BookingRequestDto request) {
        return jdbcTemplate.execute((Connection connection) -> {
            try (CallableStatement cs = connection.prepareCall("{CALL dbo.usp_AddBooking(?, ?, ?, ?)}")) {
                // Set input parameters
                cs.setInt(1, request.getUserID());
                cs.setInt(2, request.getTourDepartureID());
                if (request.getPromotionID() != null) {
                    cs.setInt(3, request.getPromotionID());
                } else {
                    cs.setNull(3, Types.INTEGER);
                }
                cs.setInt(4, request.getQuantity());

                // Execute the stored procedure
                boolean hasResults = cs.execute();
                
                // Get the result set with the new booking ID
                if (hasResults && cs.getResultSet().next()) {
                    return cs.getResultSet().getInt("NewBookingID");
                }
                
                throw new RuntimeException("Failed to create booking - no ID returned");
            } catch (SQLException e) {
                // Check if it's a capacity error from trigger
                if (e.getMessage().contains("đã vượt quá số lượng tối đa") || 
                    e.getMessage().contains("Không đủ chỗ")) {
                    throw new RuntimeException("Booking capacity exceeded: " + e.getMessage(), e);
                }
                throw new RuntimeException("Error creating booking: " + e.getMessage(), e);
            }
        });
    }

    /**
     * Get all bookings for a user
     */
    public List<BookingResponseDto> getUserBookings(Integer userID) {
        List<Booking> bookings = bookingRepository.findByUser_UserID(userID);
        return bookings.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    /**
     * Get active bookings for a user (PENDING or PAID)
     */
    public List<BookingResponseDto> getActiveUserBookings(Integer userID) {
        List<Booking> bookings = bookingRepository.findActiveBookingsByUser(userID);
        return bookings.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    /**
     * Get booking by ID
     */
    public Booking getBookingById(Integer bookingID) {
        return bookingRepository.findById(bookingID)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingID));
    }

    /**
     * Cancel a booking
     */
    @Transactional
    public void cancelBooking(Integer bookingID) {
        Booking booking = getBookingById(bookingID);
        booking.setPaymentStatus("CANCELLED");
        bookingRepository.save(booking);
    }

    /**
     * Update payment status
     */
    @Transactional
    public void updatePaymentStatus(Integer bookingID, String status) {
        Booking booking = getBookingById(bookingID);
        booking.setPaymentStatus(status);
        bookingRepository.save(booking);
    }

    /**
     * Get available slots for a tour departure
     */
    public Integer getAvailableSlots(Integer tourDepartureID) {
        TourDeparture departure = tourDepartureRepository.findById(tourDepartureID)
                .orElseThrow(() -> new RuntimeException("Tour departure not found"));
        
        Integer booked = bookingRepository.getTotalBookedQuantity(tourDepartureID);
        return departure.getMaxQuantity() - (booked != null ? booked : 0);
    }

    /**
     * Convert Booking entity to DTO
     */
    private BookingResponseDto convertToDto(Booking booking) {
        BookingResponseDto dto = new BookingResponseDto();
        dto.setBookingID(booking.getBookingID());
        dto.setUserID(booking.getUser().getUserID());
        dto.setUserFullname(booking.getUser().getFullname());
        dto.setEmail(booking.getUser().getEmail());
        dto.setPhoneNumber(booking.getUser().getPhoneNumber());
        dto.setTourDepartureID(booking.getTourDeparture().getTourDepartureID());
        dto.setTourName(booking.getTourDeparture().getTour().getTourName());
        dto.setQuantity(booking.getQuantity());
        dto.setOriginalPrice(booking.getOriginalPrice());
        dto.setDiscountAmount(booking.getDiscountAmount());
        dto.setTotalPayment(booking.getTotalPayment());
        dto.setPaymentStatus(booking.getPaymentStatus());
        dto.setBookingDate(booking.getBookingDate());
        dto.setDepartureTime(booking.getTourDeparture().getDepartureTime());
        
        // Add tour guide information
        if (booking.getTourDeparture().getTourGuide() != null) {
            dto.setGuideFullname(booking.getTourDeparture().getTourGuide().getUser().getFullname());
            BigDecimal rating = booking.getTourDeparture().getTourGuide().getRating();
            dto.setGuideRating(rating != null ? rating.doubleValue() : null);
            dto.setGuideLanguages(booking.getTourDeparture().getTourGuide().getLanguages());
        }
        
        return dto;
    }

    /**
     * 🎯 NEW: Get all passengers (bookings) for a specific tour departure
     * This will be used by tour guides to see who is joining their tour
     */
    public List<BookingResponseDto> getPassengersByDeparture(Integer tourDepartureId) {
        // Only get confirmed bookings (PAID status)
        List<Booking> bookings = bookingRepository.findByTourDeparture_TourDepartureIDAndPaymentStatus(
                tourDepartureId, "PAID");
        
        return bookings.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * 🎯 NEW: Get all bookings for a departure (including pending)
     * For comprehensive view by tour guide
     */
    public List<BookingResponseDto> getAllBookingsByDeparture(Integer tourDepartureId) {
        List<Booking> bookings = bookingRepository.findByTourDeparture_TourDepartureID(tourDepartureId);
        
        return bookings.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * 🎯 NEW: Count total passengers for a departure
     */
    public Integer getTotalPassengerCount(Integer tourDepartureId) {
        List<Booking> paidBookings = bookingRepository.findByTourDeparture_TourDepartureIDAndPaymentStatus(
                tourDepartureId, "PAID");
        
        return paidBookings.stream()
                .mapToInt(Booking::getQuantity)
                .sum();
    }
}

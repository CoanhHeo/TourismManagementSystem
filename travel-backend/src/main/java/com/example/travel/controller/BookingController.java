package com.example.travel.controller;

import com.example.travel.dto.BookingRequestDto;
import com.example.travel.dto.BookingResponseDto;
import com.example.travel.entity.Booking;
import com.example.travel.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    /**
     * Create a new booking
     * POST /api/bookings
     */
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody BookingRequestDto request) {
        try {
            Integer bookingID = bookingService.createBooking(request);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Booking created successfully");
            response.put("bookingID", bookingID);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get all bookings for a user
     * GET /api/bookings/user/{userID}
     */
    @GetMapping("/user/{userID}")
    public ResponseEntity<List<BookingResponseDto>> getUserBookings(@PathVariable Integer userID) {
        List<BookingResponseDto> bookings = bookingService.getUserBookings(userID);
        return ResponseEntity.ok(bookings);
    }

    /**
     * Get active bookings for a user
     * GET /api/bookings/user/{userID}/active
     */
    @GetMapping("/user/{userID}/active")
    public ResponseEntity<List<BookingResponseDto>> getActiveUserBookings(@PathVariable Integer userID) {
        List<BookingResponseDto> bookings = bookingService.getActiveUserBookings(userID);
        return ResponseEntity.ok(bookings);
    }

    /**
     * Get booking by ID
     * GET /api/bookings/{bookingID}
     */
    @GetMapping("/{bookingID}")
    public ResponseEntity<?> getBookingById(@PathVariable Integer bookingID) {
        try {
            Booking booking = bookingService.getBookingById(bookingID);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    /**
     * Cancel a booking
     * PUT /api/bookings/{bookingID}/cancel
     */
    @PutMapping("/{bookingID}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Integer bookingID) {
        try {
            bookingService.cancelBooking(bookingID);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Booking cancelled successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Update payment status
     * PUT /api/bookings/{bookingID}/payment-status
     */
    @PutMapping("/{bookingID}/payment-status")
    public ResponseEntity<?> updatePaymentStatus(
            @PathVariable Integer bookingID,
            @RequestParam String status) {
        try {
            bookingService.updatePaymentStatus(bookingID, status);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Payment status updated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get available slots for a tour departure
     * GET /api/bookings/departure/{tourDepartureID}/available-slots
     */
    @GetMapping("/departure/{tourDepartureID}/available-slots")
    public ResponseEntity<?> getAvailableSlots(@PathVariable Integer tourDepartureID) {
        try {
            Integer slots = bookingService.getAvailableSlots(tourDepartureID);
            Map<String, Object> response = new HashMap<>();
            response.put("tourDepartureID", tourDepartureID);
            response.put("availableSlots", slots);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
}

package com.example.travel.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler for the travel application
 * Provides consistent error responses across all endpoints
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(TravelApplicationException.CustomerNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleCustomerNotFound(TravelApplicationException.CustomerNotFoundException ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.NOT_FOUND.value(),
            "CUSTOMER_NOT_FOUND",
            ex.getMessage(),
            LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(TravelApplicationException.TourNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleTourNotFound(TravelApplicationException.TourNotFoundException ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.NOT_FOUND.value(),
            "TOUR_NOT_FOUND",
            ex.getMessage(),
            LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(TravelApplicationException.AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthentication(TravelApplicationException.AuthenticationException ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.UNAUTHORIZED.value(),
            "AUTHENTICATION_FAILED",
            ex.getMessage(),
            LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(TravelApplicationException.OtpException.class)
    public ResponseEntity<ErrorResponse> handleOtp(TravelApplicationException.OtpException ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            "OTP_ERROR",
            ex.getMessage(),
            LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(TravelApplicationException.ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidation(TravelApplicationException.ValidationException ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            "VALIDATION_ERROR",
            ex.getMessage(),
            LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(TravelApplicationException.RegistrationException.class)
    public ResponseEntity<ErrorResponse> handleRegistration(TravelApplicationException.RegistrationException ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            "REGISTRATION_ERROR",
            ex.getMessage(),
            LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(TravelApplicationException.BookingException.class)
    public ResponseEntity<ErrorResponse> handleBooking(TravelApplicationException.BookingException ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            "BOOKING_ERROR",
            ex.getMessage(),
            LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        ErrorResponse error = new ErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            "VALIDATION_FAILED",
            "Dữ liệu đầu vào không hợp lệ",
            LocalDateTime.now()
        );
        error.setFieldErrors(errors);
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "INTERNAL_ERROR",
            "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.",
            LocalDateTime.now()
        );
        
        // Log the actual exception for debugging
        System.err.println("Unexpected error: " + ex.getMessage());
        ex.printStackTrace();
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    // Error response class
    public static class ErrorResponse {
        private int status;
        private String code;
        private String message;
        private LocalDateTime timestamp;
        private Map<String, String> fieldErrors;

        public ErrorResponse(int status, String code, String message, LocalDateTime timestamp) {
            this.status = status;
            this.code = code;
            this.message = message;
            this.timestamp = timestamp;
        }

        // Getters and Setters
        public int getStatus() { return status; }
        public void setStatus(int status) { this.status = status; }

        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

        public Map<String, String> getFieldErrors() { return fieldErrors; }
        public void setFieldErrors(Map<String, String> fieldErrors) { this.fieldErrors = fieldErrors; }
    }
}
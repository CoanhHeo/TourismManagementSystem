package com.example.travel.exception;

/**
 * Custom exceptions for the travel application
 */
public class TravelApplicationException extends RuntimeException {
    
    public TravelApplicationException(String message) {
        super(message);
    }

    public TravelApplicationException(String message, Throwable cause) {
        super(message, cause);
    }

    // Specific business exceptions
    public static class CustomerNotFoundException extends TravelApplicationException {
        public CustomerNotFoundException(String message) {
            super(message);
        }
    }

    public static class TourNotFoundException extends TravelApplicationException {
        public TourNotFoundException(String message) {
            super(message);
        }
    }

    public static class AuthenticationException extends TravelApplicationException {
        public AuthenticationException(String message) {
            super(message);
        }
    }

    public static class OtpException extends TravelApplicationException {
        public OtpException(String message) {
            super(message);
        }
    }

    public static class ValidationException extends TravelApplicationException {
        public ValidationException(String message) {
            super(message);
        }
    }

    public static class RegistrationException extends TravelApplicationException {
        public RegistrationException(String message) {
            super(message);
        }
    }

    public static class BookingException extends TravelApplicationException {
        public BookingException(String message) {
            super(message);
        }
    }
}
package com.example.travel.utils;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Utility class for common operations
 */
public class TravelUtils {

    private static final SecureRandom random = new SecureRandom();
    private static final String CHARACTERS = "0123456789";

    /**
     * Generate a random OTP code
     */
    public static String generateOtp(int length) {
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < length; i++) {
            otp.append(CHARACTERS.charAt(random.nextInt(CHARACTERS.length())));
        }
        return otp.toString();
    }

    /**
     * Format LocalDateTime to readable string
     */
    public static String formatDateTime(LocalDateTime dateTime) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
        return dateTime.format(formatter);
    }

    /**
     * Generate a booking reference code
     */
    public static String generateBookingReference() {
        String timestamp = String.valueOf(System.currentTimeMillis());
        String randomPart = generateOtp(4);
        return "TRV" + timestamp.substring(timestamp.length() - 6) + randomPart;
    }

    /**
     * Validate Vietnamese phone number
     */
    public static boolean isValidVietnamesePhone(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            return false;
        }
        return phone.matches("^(\\+84|0)[3-9][0-9]{8}$");
    }

    /**
     * Validate email format
     */
    public static boolean isValidEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        return email.matches("^[\\w\\.-]+@[\\w\\.-]+\\.[a-zA-Z]{2,}$");
    }

    /**
     * Mask sensitive information (phone, email)
     */
    public static String maskPhone(String phone) {
        if (phone == null || phone.length() < 4) {
            return phone;
        }
        return phone.substring(0, 3) + "****" + phone.substring(phone.length() - 3);
    }

    public static String maskEmail(String email) {
        if (email == null || !email.contains("@")) {
            return email;
        }
        String[] parts = email.split("@");
        String localPart = parts[0];
        String domain = parts[1];
        
        if (localPart.length() <= 2) {
            return localPart + "@" + domain;
        }
        
        return localPart.substring(0, 2) + "****@" + domain;
    }

    /**
     * Calculate age from birth year
     */
    public static int calculateAge(int birthYear) {
        return LocalDateTime.now().getYear() - birthYear;
    }

    /**
     * Private constructor to prevent instantiation
     */
    private TravelUtils() {
        throw new UnsupportedOperationException("Utility class cannot be instantiated");
    }
}
package com.example.travel.service;

import com.example.travel.entity.TourDeparture;
import com.example.travel.entity.TourGuide;
import com.example.travel.entity.User;
import com.example.travel.repository.TourDepartureRepository;
import com.example.travel.repository.TourGuideRepository;
import com.example.travel.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TourGuideService {

    @Autowired
    private TourGuideRepository tourGuideRepository;
    
    @Autowired
    private TourDepartureRepository tourDepartureRepository;
    
    @Autowired
    private UserRepository userRepository;

    /**
     * Get TourGuide by UserID
     */
    public TourGuide getTourGuideByUserId(Integer userId) {
        return tourGuideRepository.findByUser_UserID(userId)
                .orElseThrow(() -> new RuntimeException("Tour guide not found for user ID: " + userId));
    }

    /**
     * Get all tour departures assigned to a specific tour guide
     */
    public List<TourDeparture> getAssignedDepartures(Integer userId) {
        TourGuide tourGuide = getTourGuideByUserId(userId);
        return tourDepartureRepository.findByTourGuide_TourGuideID(tourGuide.getTourGuideID());
    }

    /**
     * Get upcoming departures for a tour guide (departures that haven't started yet)
     */
    public List<TourDeparture> getUpcomingDepartures(Integer userId) {
        TourGuide tourGuide = getTourGuideByUserId(userId);
        LocalDateTime now = LocalDateTime.now();
        return tourDepartureRepository.findByTourGuide_TourGuideIDAndDepartureTimeGreaterThanEqual(
                tourGuide.getTourGuideID(), now);
    }

    /**
     * Get current/ongoing departures for a tour guide 
     */
    public List<TourDeparture> getCurrentDepartures(Integer userId) {
        TourGuide tourGuide = getTourGuideByUserId(userId);
        LocalDateTime now = LocalDateTime.now();
        return tourDepartureRepository.findByTourGuide_TourGuideIDAndDepartureTimeLessThanEqualAndReturnTimeGreaterThanEqual(
                tourGuide.getTourGuideID(), now, now);
    }

    /**
     * Get all active departures (upcoming + current) for a tour guide
     */
    public List<TourDeparture> getActiveDepartures(Integer userId) {
        TourGuide tourGuide = getTourGuideByUserId(userId);
        LocalDateTime now = LocalDateTime.now();
        // Get departures that haven't ended yet
        return tourDepartureRepository.findByTourGuide_TourGuideIDAndReturnTimeGreaterThanEqualOrderByDepartureTime(
                tourGuide.getTourGuideID(), now);
    }

    /**
     * Check if a user is a tour guide
     */
    public boolean isTourGuide(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user has Tour Guide role (RoleID = 3)
        return "Tour Guide".equals(user.getRole().getRoleName());
    }

    /**
     * Validate tour guide access - ensure user is authenticated and is a tour guide
     */
    public void validateTourGuideAccess(Integer userId) {
        if (!isTourGuide(userId)) {
            throw new RuntimeException("Access denied. User is not a tour guide.");
        }
    }
}
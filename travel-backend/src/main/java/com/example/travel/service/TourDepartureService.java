package com.example.travel.service;

import com.example.travel.dto.PromotionDTO;
import com.example.travel.dto.TourDepartureDto;
import com.example.travel.entity.Promotion;
import com.example.travel.entity.TourDeparture;
import com.example.travel.repository.BookingRepository;
import com.example.travel.repository.PromotionRepository;
import com.example.travel.repository.TourDepartureRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TourDepartureService {

    @Autowired
    private TourDepartureRepository tourDepartureRepository;

    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private PromotionRepository promotionRepository;

    /**
     * Get all upcoming departures
     */
    public List<TourDepartureDto> getUpcomingDepartures() {
        List<TourDeparture> departures = tourDepartureRepository.findUpcomingDepartures(LocalDateTime.now());
        return departures.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    /**
     * Get upcoming departures for a specific tour
     */
    public List<TourDepartureDto> getUpcomingDeparturesByTour(Integer tourID) {
        List<TourDeparture> departures = tourDepartureRepository.findUpcomingDeparturesByTour(tourID, LocalDateTime.now());
        return departures.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    /**
     * Get departure by ID
     */
    public TourDeparture getDepartureById(Integer tourDepartureID) {
        return tourDepartureRepository.findById(tourDepartureID)
                .orElseThrow(() -> new RuntimeException("Tour departure not found with ID: " + tourDepartureID));
    }

    /**
     * Get departure with availability info
     */
    public TourDepartureDto getDepartureWithAvailability(Integer tourDepartureID) {
        TourDeparture departure = getDepartureById(tourDepartureID);
        return convertToDto(departure);
    }

    /**
     * Get all departures for a tour
     */
    public List<TourDepartureDto> getDeparturesByTour(Integer tourID) {
        List<TourDeparture> departures = tourDepartureRepository.findByTour_TourID(tourID);
        return departures.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    /**
     * Check if departure has available slots
     */
    public boolean hasAvailableSlots(Integer tourDepartureID, Integer requestedQuantity) {
        TourDeparture departure = getDepartureById(tourDepartureID);
        Integer booked = bookingRepository.getTotalBookedQuantity(tourDepartureID);
        int bookedCount = booked != null ? booked : 0;
        int available = departure.getMaxQuantity() - bookedCount;
        return available >= requestedQuantity;
    }

    /**
     * Convert entity to DTO with availability calculation
     */
    private TourDepartureDto convertToDto(TourDeparture departure) {
        TourDepartureDto dto = new TourDepartureDto();
        dto.setTourDepartureID(departure.getTourDepartureID());
        dto.setTourID(departure.getTour().getTourID());
        dto.setTourName(departure.getTour().getTourName());
        dto.setTouristDestination(departure.getTour().getTouristDestination());
        dto.setDayNum(departure.getDayNum());
        dto.setOriginalPrice(departure.getOriginalPrice());
        dto.setDepartureLocation(departure.getDepartureLocation());
        dto.setDepartureTime(departure.getDepartureTime());
        dto.setReturnTime(departure.getReturnTime());
        dto.setMaxQuantity(departure.getMaxQuantity());
        
        // Calculate available slots
        Integer booked = bookingRepository.getTotalBookedQuantity(departure.getTourDepartureID());
        int availableSlots = departure.getMaxQuantity() - (booked != null ? booked : 0);
        dto.setAvailableSlots(availableSlots);
        
        // Get active promotion for this tour
        List<Promotion> promotions = promotionRepository.findActivePromotionsByTour(
            departure.getTour().getTourID(), 
            LocalDate.now()
        );
        
        if (!promotions.isEmpty()) {
            Promotion promotion = promotions.get(0); // Get first active promotion
            PromotionDTO promotionDto = new PromotionDTO();
            promotionDto.setPromotionID(promotion.getPromotionID());
            promotionDto.setPromotionName(promotion.getPromotionName());
            promotionDto.setPercent(promotion.getPercent());
            promotionDto.setStartDate(promotion.getStartDate());
            promotionDto.setEndDate(promotion.getEndDate());
            dto.setPromotion(promotionDto);
        }
        
        // 🎯 Add TourGuide information if assigned
        if (departure.getTourGuide() != null) {
            TourDepartureDto.TourGuideDto guideDto = new TourDepartureDto.TourGuideDto();
            guideDto.setTourGuideID(departure.getTourGuide().getTourGuideID());
            guideDto.setUserID(departure.getTourGuide().getUser().getUserID());
            guideDto.setFullname(departure.getTourGuide().getUser().getFullname());
            guideDto.setEmail(departure.getTourGuide().getUser().getEmail());
            guideDto.setRating(departure.getTourGuide().getRating() != null 
                ? departure.getTourGuide().getRating().doubleValue() 
                : null);
            guideDto.setLanguages(departure.getTourGuide().getLanguages());
            dto.setTourGuide(guideDto);
        }
        
        return dto;
    }
}
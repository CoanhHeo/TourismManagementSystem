package com.example.travel.repository;

import com.example.travel.entity.TourDeparture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TourDepartureRepository extends JpaRepository<TourDeparture, Integer> {
    List<TourDeparture> findByTour_TourID(Integer tourID);
    
    @Query("SELECT td FROM TourDeparture td WHERE td.departureTime >= :currentDate ORDER BY td.departureTime ASC")
    List<TourDeparture> findUpcomingDepartures(@Param("currentDate") LocalDateTime currentDate);
    
    @Query("SELECT td FROM TourDeparture td WHERE td.tour.tourID = :tourID AND td.departureTime >= :currentDate ORDER BY td.departureTime ASC")
    List<TourDeparture> findUpcomingDeparturesByTour(@Param("tourID") Integer tourID, @Param("currentDate") LocalDateTime currentDate);
    
    /**
     * Find minimum price for a tour from all its departures
     */
    @Query("SELECT MIN(td.originalPrice) FROM TourDeparture td WHERE td.tour.tourID = :tourId")
    Double findMinPriceByTourId(@Param("tourId") Integer tourId);
    
    /**
     * 🎯 Check if a tour guide has conflicting schedule
     * Find departures where:
     * - Guide is assigned
     * - Date ranges overlap with the given period
     * Logic: (start1 <= end2) AND (end1 >= start2) = overlap
     */
    @Query("SELECT td FROM TourDeparture td " +
           "WHERE td.tourGuide.tourGuideID = :guideId " +
           "AND td.departureTime <= :endTime " +
           "AND td.returnTime >= :startTime")
    List<TourDeparture> findConflictingSchedules(
        @Param("guideId") Integer guideId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );
    
    /**
     * 🎯 Check conflicts excluding a specific departure (for updates)
     */
    @Query("SELECT td FROM TourDeparture td " +
           "WHERE td.tourGuide.tourGuideID = :guideId " +
           "AND td.tourDepartureID <> :excludeId " +
           "AND td.departureTime <= :endTime " +
           "AND td.returnTime >= :startTime")
    List<TourDeparture> findConflictingSchedulesExcluding(
        @Param("guideId") Integer guideId,
        @Param("excludeId") Integer excludeId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );

    /**
     * 🎯 NEW: Query methods for Tour Guide dashboard
     */
    
    // Get all departures assigned to a tour guide
    List<TourDeparture> findByTourGuide_TourGuideID(Integer tourGuideId);
    
    // Get upcoming departures for a tour guide (haven't started yet)
    List<TourDeparture> findByTourGuide_TourGuideIDAndDepartureTimeGreaterThanEqual(
        Integer tourGuideId, LocalDateTime departureTime);
    
    // Get current/ongoing departures (started but not ended)
    List<TourDeparture> findByTourGuide_TourGuideIDAndDepartureTimeLessThanEqualAndReturnTimeGreaterThanEqual(
        Integer tourGuideId, LocalDateTime startCheck, LocalDateTime endCheck);
    
    // Get active departures (upcoming + current) ordered by departure time
    List<TourDeparture> findByTourGuide_TourGuideIDAndReturnTimeGreaterThanEqualOrderByDepartureTime(
        Integer tourGuideId, LocalDateTime currentTime);
}

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
}

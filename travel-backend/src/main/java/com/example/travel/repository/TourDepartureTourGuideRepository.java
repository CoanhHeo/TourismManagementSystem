package com.example.travel.repository;

import com.example.travel.entity.TourDepartureTourGuide;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TourDepartureTourGuideRepository extends JpaRepository<TourDepartureTourGuide, Integer> {
    
    @Query("SELECT tdtg.tourGuideID FROM TourDepartureTourGuide tdtg WHERE tdtg.tourDepartureID = :tourDepartureID")
    List<Integer> findTourGuideIdsByTourDepartureId(@Param("tourDepartureID") Integer tourDepartureID);
    
    @Query("SELECT tdtg.tourDepartureID FROM TourDepartureTourGuide tdtg WHERE tdtg.tourGuideID = :tourGuideID")
    List<Integer> findTourDepartureIdsByTourGuideId(@Param("tourGuideID") Integer tourGuideID);
    
    void deleteByTourDepartureIDAndTourGuideID(Integer tourDepartureID, Integer tourGuideID);
    
    void deleteByTourDepartureID(Integer tourDepartureID);
}

package com.example.travel.repository;

import com.example.travel.entity.Tour;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TourRepository extends JpaRepository<Tour, Integer> {
    List<Tour> findByTourType_TourTypeID(Integer tourTypeID);
    
    List<Tour> findByTouristDestinationContainingIgnoreCase(String destination);
    
    @Query("SELECT t FROM Tour t WHERE LOWER(t.tourName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Tour> searchTours(String keyword);
}

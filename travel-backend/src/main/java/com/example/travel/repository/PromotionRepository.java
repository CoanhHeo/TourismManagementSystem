package com.example.travel.repository;

import com.example.travel.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Integer> {
    /**
     * Find all active promotions based on current date
     */
    @Query("SELECT p FROM Promotion p WHERE p.startDate <= :currentDate AND p.endDate >= :currentDate")
    List<Promotion> findActivePromotions(@Param("currentDate") LocalDate currentDate);
    
    /**
     * ✅ CẬP NHẬT: Find active promotion for a specific tour
     * Join trực tiếp qua Tours.PromotionID (không cần Tours_Promotion)
     */
    @Query(value = "SELECT p.* FROM Promotion p " +
           "INNER JOIN Tours t ON p.PromotionID = t.PromotionID " +
           "WHERE t.TourID = :tourID " +
           "AND p.StartDate <= :currentDate " +
           "AND p.EndDate >= :currentDate", 
           nativeQuery = true)
    List<Promotion> findActivePromotionsByTour(@Param("tourID") Integer tourID, @Param("currentDate") LocalDate currentDate);
}

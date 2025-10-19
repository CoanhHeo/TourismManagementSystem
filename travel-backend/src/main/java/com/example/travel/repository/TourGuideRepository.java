package com.example.travel.repository;

import com.example.travel.entity.TourGuide;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TourGuideRepository extends JpaRepository<TourGuide, Integer> {
    
    Optional<TourGuide> findByUser_UserID(Integer userID);
    
    /**
     * Lấy tất cả guides có User IsActive = true VÀ role = "Tour Guide"
     * Chỉ những User có role "Tour Guide" mới được phân công
     */
    @Query("SELECT tg FROM TourGuide tg " +
           "WHERE tg.user.isActive = true " +
           "AND tg.user.role.roleName = 'Tour Guide'")
    List<TourGuide> findAllActiveGuides();
}

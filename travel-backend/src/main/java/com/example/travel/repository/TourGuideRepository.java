package com.example.travel.repository;

import com.example.travel.entity.TourGuide;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TourGuideRepository extends JpaRepository<TourGuide, Integer> {
    Optional<TourGuide> findByUser_UserID(Integer userID);
}

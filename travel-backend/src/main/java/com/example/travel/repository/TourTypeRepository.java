package com.example.travel.repository;

import com.example.travel.entity.TourType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TourTypeRepository extends JpaRepository<TourType, Integer> {
}

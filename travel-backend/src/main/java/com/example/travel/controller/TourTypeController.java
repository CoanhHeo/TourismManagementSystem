package com.example.travel.controller;

import com.example.travel.entity.TourType;
import com.example.travel.repository.TourTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tour-types")
public class TourTypeController {

    @Autowired
    private TourTypeRepository tourTypeRepository;

    /**
     * Get all tour types
     * GET /api/tour-types
     */
    @GetMapping
    public ResponseEntity<List<TourType>> getAllTourTypes() {
        List<TourType> tourTypes = tourTypeRepository.findAll();
        return ResponseEntity.ok(tourTypes);
    }

    /**
     * Get tour type by ID
     * GET /api/tour-types/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<TourType> getTourTypeById(@PathVariable Integer id) {
        return tourTypeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}

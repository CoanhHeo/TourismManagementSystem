package com.example.travel.repository;

import com.example.travel.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
    
    List<User> findByRole_RoleName(String roleName);
    
    boolean existsByEmail(String email);
    
    long countByRole_RoleID(Integer roleID);
}

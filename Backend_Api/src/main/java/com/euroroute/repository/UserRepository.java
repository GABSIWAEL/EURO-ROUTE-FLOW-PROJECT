package com.euroroute.repository;

import com.euroroute.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.role = 'DRIVER' AND u.isActive = true")
    List<User> findAllActiveDrivers();

    @Query("SELECT u FROM User u WHERE u.isActive = true")
    List<User> findAllActive();
}

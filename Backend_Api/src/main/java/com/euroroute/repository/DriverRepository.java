package com.euroroute.repository;

import com.euroroute.entity.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DriverRepository extends JpaRepository<Driver, String> {
    List<Driver> findByIsActive(boolean isActive);

    Optional<Driver> findByPhone(String phone);

    Optional<Driver> findByEmail(String email);

    Optional<Driver> findByUserId(String userId);
}

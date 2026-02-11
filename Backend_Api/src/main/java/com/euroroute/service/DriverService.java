package com.euroroute.service;

import com.euroroute.dto.DriverDTO;
import com.euroroute.entity.Driver;
import com.euroroute.repository.DriverRepository;
import com.euroroute.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DriverService {

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private UserRepository userRepository;

    public DriverDTO createDriver(DriverDTO dto) {
        Driver driver = new Driver();
        driver.setFullName(dto.getFullName());
        driver.setPhone(dto.getPhone());
        driver.setEmail(dto.getEmail());
        driver.setVehicleInfo(dto.getVehicleInfo());
        driver.setActive(true);

        Driver saved = driverRepository.save(driver);
        return convertToDTO(saved);
    }

    public DriverDTO getDriver(String id) {
        return driverRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Driver not found"));
    }

    public List<DriverDTO> getAllDrivers() {
        return driverRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<DriverDTO> getActiveDrivers() {
        return driverRepository.findByIsActive(true).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public DriverDTO updateDriver(String id, DriverDTO dto) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        if (dto.getFullName() != null) {
            driver.setFullName(dto.getFullName());
        }
        if (dto.getPhone() != null) {
            driver.setPhone(dto.getPhone());
        }
        if (dto.getEmail() != null) {
            driver.setEmail(dto.getEmail());
        }
        if (dto.getVehicleInfo() != null) {
            driver.setVehicleInfo(dto.getVehicleInfo());
        }

        Driver updated = driverRepository.save(driver);
        return convertToDTO(updated);
    }

    public void toggleDriverActive(String id) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Driver not found"));
        driver.setActive(!driver.isActive());
        driverRepository.save(driver);
    }

    public void deleteDriver(String id) {
        // Get the driver first
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Driver not found"));
        
        // Delete associated user if it exists
        if (driver.getUser() != null) {
            userRepository.deleteById(driver.getUser().getId());
            // The cascade delete in User entity will handle the driver deletion
        } else {
            // No associated user, just delete the driver
            driverRepository.deleteById(id);
        }
    }

    public DriverDTO getDriverByUserId(String userId) {
        return driverRepository.findByUserId(userId)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Driver not found for user: " + userId));
    }

    public DriverDTO getDriverByEmail(String email) {
        return driverRepository.findByEmail(email)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Driver not found for email: " + email));
    }

    private DriverDTO convertToDTO(Driver driver) {
        return DriverDTO.builder()
                .id(driver.getId())
                .fullName(driver.getFullName())
                .phone(driver.getPhone())
                .email(driver.getEmail())
                .isActive(driver.isActive())
                .vehicleInfo(driver.getVehicleInfo())
                .createdAt(driver.getCreatedAt())
                .updatedAt(driver.getUpdatedAt())
                .build();
    }
}

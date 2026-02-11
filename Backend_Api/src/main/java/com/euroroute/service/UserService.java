package com.euroroute.service;

import com.euroroute.dto.UserDTO;
import com.euroroute.dto.CreateUserRequest;
import com.euroroute.entity.User;
import com.euroroute.entity.Driver;
import com.euroroute.repository.UserRepository;
import com.euroroute.repository.DriverRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Get all available users that can be assigned as drivers.
     * Returns active DRIVER role users.
     */
    public List<UserDTO> getAvailableUsers() {
        return userRepository.findAllActiveDrivers().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all active users in the system
     */
    public List<UserDTO> getAllActiveUsers() {
        return userRepository.findAllActive().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get a single user by ID
     */
    public UserDTO getUser(String id) {
        return userRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * Create a new user (admin-only operation)
     */
    public UserDTO createUser(CreateUserRequest request) {
        // Validate email doesn't already exist
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // Validate required fields
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new RuntimeException("Email is required");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new RuntimeException("Password is required");
        }
        if (request.getFullName() == null || request.getFullName().isBlank()) {
            throw new RuntimeException("Full name is required");
        }
        if (request.getRole() == null || request.getRole().isBlank()) {
            throw new RuntimeException("Role is required");
        }

        // For DRIVER role, phone is required
        User.UserRole role = User.UserRole.valueOf(request.getRole().toUpperCase());
        if (role == User.UserRole.DRIVER && (request.getPhone() == null || request.getPhone().isBlank())) {
            throw new RuntimeException("Phone number is required for drivers");
        }

        // Create new user entity
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(role)
                .isActive(true)
                .build();

        // Save user first
        User savedUser = userRepository.save(user);

        // If DRIVER role, also create Driver profile
        if (role == User.UserRole.DRIVER) {
            Driver driver = Driver.builder()
                    .user(savedUser)
                    .fullName(savedUser.getFullName())
                    .phone(request.getPhone())
                    .email(savedUser.getEmail())
                    .isActive(true)
                    .build();
            driverRepository.save(driver);
            savedUser.setDriver(driver);
        }

        return convertToDTO(savedUser);
    }

    /**
     * Delete a user by ID
     * Also deletes associated driver if the user is a driver (via cascade delete)
     */
    public void deleteUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Delete the user - cascade delete will handle the driver deletion
        userRepository.deleteById(id);
    }

    /**
     * Convert User entity to UserDTO
     */
    private UserDTO convertToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name().toLowerCase())
                .isActive(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}

package com.euroroute.service;

import com.euroroute.dto.UserDTO;
import com.euroroute.entity.User;
import com.euroroute.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

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
     * Convert User entity to UserDTO
     */
    private UserDTO convertToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name().toLowerCase())
                .isActive(user.isActive())
                .build();
    }
}

package com.euroroute.controller;

import com.euroroute.dto.CreateUserRequest;
import com.euroroute.dto.UserDTO;
import com.euroroute.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:3000" }, allowCredentials = "true")
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * Create a new user (driver or admin).
     * Only accessible to ADMIN role.
     */
    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> createUser(@RequestBody CreateUserRequest request) {
        UserDTO newUser = userService.createUser(request);
        return ResponseEntity.ok(newUser);
    }

    /**
     * Get all available users that can be assigned as drivers.
     * Only accessible to authenticated users with ADMIN role.
     */
    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<UserDTO>> getAvailableUsers() {
        List<UserDTO> users = userService.getAvailableUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * Get all active users in the system.
     * Only accessible to authenticated users with ADMIN role.
     */
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<UserDTO>> getAllActiveUsers() {
        List<UserDTO> users = userService.getAllActiveUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * Get a specific user by ID.
     * Only accessible to authenticated users.
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDTO> getUser(@PathVariable String id) {
        UserDTO user = userService.getUser(id);
        return ResponseEntity.ok(user);
    }

    /**
     * Delete a user by ID.
     * Only accessible to ADMIN role.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }
}

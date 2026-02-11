package com.euroroute.controller;

import com.euroroute.dto.DriverDTO;
import com.euroroute.service.DriverService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:3000" }, allowCredentials = "true")
public class DriverController {

    @Autowired
    private DriverService driverService;

    // Admin endpoints
    @PostMapping("/api/admin/drivers")
    public ResponseEntity<DriverDTO> createDriver(@RequestBody DriverDTO dto) {
        return ResponseEntity.ok(driverService.createDriver(dto));
    }

    @GetMapping("/api/admin/drivers")
    public ResponseEntity<List<DriverDTO>> getAllDrivers() {
        return ResponseEntity.ok(driverService.getAllDrivers());
    }

    @GetMapping("/api/admin/drivers/active")
    public ResponseEntity<List<DriverDTO>> getActiveDrivers() {
        return ResponseEntity.ok(driverService.getActiveDrivers());
    }

    @GetMapping("/api/admin/drivers/{id}")
    public ResponseEntity<DriverDTO> getDriver(@PathVariable String id) {
        return ResponseEntity.ok(driverService.getDriver(id));
    }

    @PutMapping("/api/admin/drivers/{id}")
    public ResponseEntity<DriverDTO> updateDriver(@PathVariable String id, @RequestBody DriverDTO dto) {
        return ResponseEntity.ok(driverService.updateDriver(id, dto));
    }

    @PatchMapping("/api/admin/drivers/{id}/toggle-active")
    public ResponseEntity<Void> toggleDriverActive(@PathVariable String id) {
        driverService.toggleDriverActive(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/api/admin/drivers/{id}")
    public ResponseEntity<Void> deleteDriver(@PathVariable String id) {
        driverService.deleteDriver(id);
        return ResponseEntity.ok().build();
    }

    // Driver endpoints - accessible to drivers
    @GetMapping("/api/driver/me")
    @PreAuthorize("hasAnyRole('DRIVER', 'ADMIN')")
    public ResponseEntity<DriverDTO> getMyProfile() {
        // Get current authenticated user
        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        String userEmail = authentication.getName();

        // Find driver by email
        DriverDTO driver = driverService.getDriverByEmail(userEmail);
        return ResponseEntity.ok(driver);
    }

    @GetMapping("/api/driver/by-user/{userId}")
    @PreAuthorize("hasAnyRole('DRIVER', 'ADMIN')")
    public ResponseEntity<DriverDTO> getDriverByUserId(@PathVariable String userId) {
        // This endpoint will get the driver associated with a specific user
        DriverDTO driver = driverService.getDriverByUserId(userId);
        return ResponseEntity.ok(driver);
    }
}

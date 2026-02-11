package com.euroroute.controller;

import com.euroroute.dto.NotificationDTO;
import com.euroroute.service.NotificationService;
import com.euroroute.repository.UserRepository;
import com.euroroute.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    /**
     * Get active notifications for the authenticated user
     */
    @GetMapping("/active")
    public ResponseEntity<List<NotificationDTO>> getActiveNotifications() {
        String userId = getCurrentUserId();
        return ResponseEntity.ok(notificationService.getActiveNotifications(userId));
    }

    /**
     * Get all notifications for the authenticated user
     */
    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getAllNotifications() {
        String userId = getCurrentUserId();
        return ResponseEntity.ok(notificationService.getAllNotifications(userId));
    }

    /**
     * Get unread notifications count
     */
    @GetMapping("/unread/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        String userId = getCurrentUserId();
        long count = notificationService.getUnreadNotificationsCount(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * Mark a notification as read
     */
    @PostMapping("/{notificationId}/read")
    public ResponseEntity<NotificationDTO> markAsRead(@PathVariable String notificationId) {
        return ResponseEntity.ok(notificationService.markAsRead(notificationId));
    }

    /**
     * Mark all notifications as read
     */
    @PostMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        String userId = getCurrentUserId();
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    /**
     * Dismiss a notification
     */
    @PostMapping("/{notificationId}/dismiss")
    public ResponseEntity<Void> dismissNotification(@PathVariable String notificationId) {
        notificationService.dismissNotification(notificationId);
        return ResponseEntity.ok().build();
    }

    /**
     * Delete a notification
     */
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(@PathVariable String notificationId) {
        notificationService.deleteNotification(notificationId);
        return ResponseEntity.ok().build();
    }

    /**
     * Helper method to get current user ID from security context
     */
    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }

        String userEmail = authentication.getName();
        log.info("Looking up user with email: {}", userEmail);

        // Find user by email and return their UUID
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        log.info("Found user: {} with ID: {}", userEmail, user.getId());
        return user.getId();
    }
}

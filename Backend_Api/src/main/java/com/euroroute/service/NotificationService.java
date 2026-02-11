package com.euroroute.service;

import com.euroroute.dto.NotificationDTO;
import com.euroroute.entity.Notification;
import com.euroroute.entity.User;
import com.euroroute.repository.NotificationRepository;
import com.euroroute.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Create and send a notification to a user
     */
    @Transactional
    public NotificationDTO createNotification(String userId, String title, String message,
            Notification.NotificationType type) {
        return createNotification(userId, title, message, type, null, null);
    }

    /**
     * Create and send a notification with related entity information
     */
    @Transactional
    public NotificationDTO createNotification(String userId, String title, String message,
            Notification.NotificationType type,
            String relatedEntityId,
            Notification.RelatedEntityType relatedEntityType) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .relatedEntityId(relatedEntityId)
                .relatedEntityType(relatedEntityType)
                .read(false)
                .build();

        notification = notificationRepository.save(notification);
        NotificationDTO dto = NotificationDTO.fromEntity(notification);

        // Send notification via WebSocket to the user's topic
        messagingTemplate.convertAndSend(
                "/topic/notifications/" + userId,
                dto);

        log.info("Notification created for user {}: {}", userId, title);

        return dto;
    }

    /**
     * Get all active notifications for a user (not expired, not dismissed)
     */
    public List<NotificationDTO> getActiveNotifications(String userId) {
        List<Notification> notifications = notificationRepository
                .findActiveNotifications(userId, new Date());
        return notifications.stream()
                .map(NotificationDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get all notifications for a user
     */
    public List<NotificationDTO> getAllNotifications(String userId) {
        List<Notification> notifications = notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId);
        return notifications.stream()
                .map(NotificationDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get unread notifications count
     */
    public long getUnreadNotificationsCount(String userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    /**
     * Mark a notification as read
     */
    @Transactional
    public NotificationDTO markAsRead(String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + notificationId));

        notificationRepository.markAsRead(notificationId);
        notification.setRead(true);

        return NotificationDTO.fromEntity(notification);
    }

    /**
     * Mark all notifications as read for a user
     */
    @Transactional
    public void markAllAsRead(String userId) {
        notificationRepository.markAllAsRead(userId);
    }

    /**
     * Dismiss a notification (mark as dismissed)
     */
    @Transactional
    public void dismissNotification(String notificationId) {
        notificationRepository.dismissNotification(notificationId, new Date());
    }

    /**
     * Delete a notification
     */
    @Transactional
    public void deleteNotification(String notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    /**
     * Scheduled task to delete expired notifications (runs every hour)
     */
    @Scheduled(fixedRate = 3600000) // 1 hour
    @Transactional
    public void cleanupExpiredNotifications() {
        notificationRepository.deleteExpiredNotifications(new Date());
        log.info("Expired notifications cleanup completed");
    }
}

package com.euroroute.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.Date;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    @Column(name = "is_read")
    @Builder.Default
    private boolean read = false;

    @Column(name = "related_entity_id")
    private String relatedEntityId;

    @Enumerated(EnumType.STRING)
    @Column(name = "related_entity_type")
    private RelatedEntityType relatedEntityType;

    @Column(name = "created_at")
    private Date createdAt;

    @Column(name = "expires_at")
    private Date expiresAt;

    @Column(name = "dismissed_at")
    private Date dismissedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
        // Set expiration to 24 hours from creation
        expiresAt = new Date(System.currentTimeMillis() + (24 * 60 * 60 * 1000));
    }

    public enum NotificationType {
        NEW_DELIVERY, // New delivery request
        NEW_MESSAGE, // New message received
        NEW_USER, // New user created
        DRIVER_ASSIGNED, // Driver assigned to delivery
        DELIVERY_COMPLETED, // Delivery completed
        DELIVERY_CANCELLED, // Delivery cancelled
        STATUS_CHANGED, // Generic status change
        SYSTEM, // System notification
        OTHER
    }

    public enum RelatedEntityType {
        DELIVERY_REQUEST,
        DRIVER,
        USER,
        MESSAGE
    }
}

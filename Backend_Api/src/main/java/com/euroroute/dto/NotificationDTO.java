package com.euroroute.dto;

import com.euroroute.entity.Notification;
import lombok.*;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {
    private String id;
    private String userId;
    private String title;
    private String message;
    private String type;
    private boolean read;
    private String relatedEntityId;
    private String relatedEntityType;
    private Date createdAt;
    private Date expiresAt;
    private Date dismissedAt;

    public static NotificationDTO fromEntity(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .userId(notification.getUser().getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType().toString())
                .read(notification.isRead())
                .relatedEntityId(notification.getRelatedEntityId())
                .relatedEntityType(
                        notification.getRelatedEntityType() != null ? notification.getRelatedEntityType().toString()
                                : null)
                .createdAt(notification.getCreatedAt())
                .expiresAt(notification.getExpiresAt())
                .dismissedAt(notification.getDismissedAt())
                .build();
    }
}

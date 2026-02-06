package com.euroroute.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactMessageDTO {
    private String id;
    private String name;
    private String email;
    private String subject;
    private String message;
    private boolean isRead;
    private String response;
    private LocalDateTime createdAt;
}

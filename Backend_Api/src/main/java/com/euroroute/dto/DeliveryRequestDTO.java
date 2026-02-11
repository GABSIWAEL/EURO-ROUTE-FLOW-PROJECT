package com.euroroute.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryRequestDTO {
    private String id;
    private String clientName;
    private String clientPhone;
    private String clientEmail;
    private String pickupAddress;
    private String deliveryAddress;
    private Double pickupLat;
    private Double pickupLng;
    private Double deliveryLat;
    private Double deliveryLng;
    private Boolean pickupFromMap;
    private Boolean deliveryFromMap;
    private String itemType;
    private String itemSize;
    private String itemWeight;
    private LocalDate requestedDate;
    private String requestedTime;
    private String status;
    private String assignedDriverId;
    private String clientNotes;
    private String internalNotes;
    private String trackingNumber;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime completedAt;
}

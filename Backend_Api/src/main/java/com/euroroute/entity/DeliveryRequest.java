package com.euroroute.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "client_name", nullable = false)
    private String clientName;

    @Column(name = "client_phone", nullable = false)
    private String clientPhone;

    @Column(name = "client_email")
    private String clientEmail;

    @Column(name = "pickup_address", nullable = false)
    private String pickupAddress;

    @Column(name = "delivery_address", nullable = false)
    private String deliveryAddress;

    @Column(name = "item_type", nullable = false)
    private String itemType;

    @Column(name = "item_size")
    private String itemSize;

    @Column(name = "item_weight")
    private String itemWeight;

    @Column(name = "requested_date", nullable = false)
    private LocalDate requestedDate;

    @Column(name = "requested_time")
    private String requestedTime;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private DeliveryStatus status = DeliveryStatus.EN_ATTENTE;

    @Column(name = "assigned_driver_id")
    private String assignedDriverId;

    @Column(name = "client_notes")
    private String clientNotes;

    @Column(name = "internal_notes")
    private String internalNotes;

    @Column(name = "tracking_number")
    private String trackingNumber;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum DeliveryStatus {
        EN_ATTENTE,
        EN_COURS,
        LIVRE
    }
}

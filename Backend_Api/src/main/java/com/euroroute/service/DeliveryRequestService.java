package com.euroroute.service;

import com.euroroute.dto.DeliveryRequestDTO;
import com.euroroute.entity.DeliveryRequest;
import com.euroroute.entity.Notification;
import com.euroroute.entity.User;
import com.euroroute.repository.DeliveryRequestRepository;
import com.euroroute.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DeliveryRequestService {

    @Autowired
    private DeliveryRequestRepository deliveryRequestRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    public DeliveryRequestDTO createDeliveryRequest(DeliveryRequestDTO dto) {
        DeliveryRequest request = new DeliveryRequest();
        request.setClientName(dto.getClientName());
        request.setClientPhone(dto.getClientPhone());
        request.setClientEmail(dto.getClientEmail());
        request.setPickupAddress(dto.getPickupAddress());
        request.setDeliveryAddress(dto.getDeliveryAddress());
        request.setItemType(dto.getItemType());
        request.setItemSize(dto.getItemSize());
        request.setItemWeight(dto.getItemWeight());
        request.setRequestedDate(dto.getRequestedDate());
        request.setRequestedTime(dto.getRequestedTime());
        request.setClientNotes(dto.getClientNotes());
        request.setStatus(DeliveryRequest.DeliveryStatus.EN_ATTENTE);

        // Generate tracking number
        request.setTrackingNumber(generateTrackingNumber());

        DeliveryRequest saved = deliveryRequestRepository.save(request);

        // Notify admin users
        notifyAdminUsers(
                "Nouvelle demande de livraison",
                "Une nouvelle demande de livraison a été créée pour " + dto.getClientName() + " (Tracking: "
                        + saved.getTrackingNumber() + ")",
                Notification.NotificationType.NEW_DELIVERY,
                saved.getId(),
                Notification.RelatedEntityType.DELIVERY_REQUEST);

        return convertToDTO(saved);
    }

    public DeliveryRequestDTO getDeliveryRequest(String id) {
        return deliveryRequestRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Delivery request not found"));
    }

    public List<DeliveryRequestDTO> getAllDeliveryRequests() {
        return deliveryRequestRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<DeliveryRequestDTO> getDeliveryRequestsByStatus(String status) {
        DeliveryRequest.DeliveryStatus deliveryStatus = DeliveryRequest.DeliveryStatus.valueOf(status.toUpperCase());
        return deliveryRequestRepository.findByStatus(deliveryStatus).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<DeliveryRequestDTO> getDeliveryRequestsByDriver(String driverId) {
        return deliveryRequestRepository.findByAssignedDriverId(driverId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public DeliveryRequestDTO updateDeliveryRequest(String id, DeliveryRequestDTO dto) {
        DeliveryRequest request = deliveryRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Delivery request not found"));

        String oldStatus = request.getStatus().toString();
        String newStatus = dto.getStatus() != null ? dto.getStatus().toUpperCase() : oldStatus;

        if (dto.getStatus() != null) {
            request.setStatus(DeliveryRequest.DeliveryStatus.valueOf(newStatus));
        }
        if (dto.getAssignedDriverId() != null) {
            request.setAssignedDriverId(dto.getAssignedDriverId());
        }
        if (dto.getInternalNotes() != null) {
            request.setInternalNotes(dto.getInternalNotes());
        }
        if (dto.getTrackingNumber() != null) {
            request.setTrackingNumber(dto.getTrackingNumber());
        }

        DeliveryRequest updated = deliveryRequestRepository.save(request);

        // Notify on status change
        if (!oldStatus.equals(newStatus)) {
            notifyAdminUsers(
                    "Statut de livraison modifié",
                    "La demande " + updated.getTrackingNumber() + " est passée de " + oldStatus + " à " + newStatus,
                    Notification.NotificationType.STATUS_CHANGED,
                    updated.getId(),
                    Notification.RelatedEntityType.DELIVERY_REQUEST);
        }

        return convertToDTO(updated);
    }

    public void deleteDeliveryRequest(String id) {
        deliveryRequestRepository.deleteById(id);
    }

    public DeliveryRequestDTO markDeliveryAsDelivered(String trackingNumber) {
        DeliveryRequest request = deliveryRequestRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new RuntimeException(
                        "Delivery request not found with tracking number: " + trackingNumber));

        request.setStatus(DeliveryRequest.DeliveryStatus.LIVRE);
        request.setCompletedAt(java.time.LocalDateTime.now());

        DeliveryRequest updated = deliveryRequestRepository.save(request);

        // Notify admin users about completion
        notifyAdminUsers(
                "Livraison complétée",
                "La demande " + trackingNumber + " pour " + updated.getClientName() + " a été marquée comme livrée",
                Notification.NotificationType.DELIVERY_COMPLETED,
                updated.getId(),
                Notification.RelatedEntityType.DELIVERY_REQUEST);

        return convertToDTO(updated);
    }

    private DeliveryRequestDTO convertToDTO(DeliveryRequest request) {
        return DeliveryRequestDTO.builder()
                .id(request.getId())
                .clientName(request.getClientName())
                .clientPhone(request.getClientPhone())
                .clientEmail(request.getClientEmail())
                .pickupAddress(request.getPickupAddress())
                .deliveryAddress(request.getDeliveryAddress())
                .itemType(request.getItemType())
                .itemSize(request.getItemSize())
                .itemWeight(request.getItemWeight())
                .requestedDate(request.getRequestedDate())
                .requestedTime(request.getRequestedTime())
                .status(request.getStatus().toString())
                .assignedDriverId(request.getAssignedDriverId())
                .clientNotes(request.getClientNotes())
                .internalNotes(request.getInternalNotes())
                .trackingNumber(request.getTrackingNumber())
                .createdAt(request.getCreatedAt())
                .updatedAt(request.getUpdatedAt())
                .completedAt(request.getCompletedAt())
                .build();
    }

    private String generateTrackingNumber() {
        // Generate tracking number: ER + timestamp + random 4 digits
        long timestamp = System.currentTimeMillis();
        int random = (int) (Math.random() * 10000);
        return String.format("ER%d%04d", timestamp % 1000000, random);
    }

    /**
     * Notify all admin users of an important delivery event
     */
    private void notifyAdminUsers(String title, String message,
            Notification.NotificationType type,
            String relatedEntityId,
            Notification.RelatedEntityType relatedEntityType) {
        try {
            // Find all admin users
            List<User> admins = userRepository.findAll().stream()
                    .filter(user -> user.getRole() == User.UserRole.ADMIN)
                    .collect(Collectors.toList());

            // Send notification to each admin
            for (User admin : admins) {
                notificationService.createNotification(
                        admin.getId(),
                        title,
                        message,
                        type,
                        relatedEntityId,
                        relatedEntityType);
            }
        } catch (Exception e) {
            // Log but don't fail the operation if notification fails
            System.err.println("Failed to send notifications: " + e.getMessage());
        }
    }
}

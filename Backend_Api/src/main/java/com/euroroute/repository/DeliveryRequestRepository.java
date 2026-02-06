package com.euroroute.repository;

import com.euroroute.entity.DeliveryRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryRequestRepository extends JpaRepository<DeliveryRequest, String> {
    List<DeliveryRequest> findByStatus(DeliveryRequest.DeliveryStatus status);

    List<DeliveryRequest> findByAssignedDriverId(String driverId);

    List<DeliveryRequest> findByRequestedDate(LocalDate date);

    Optional<DeliveryRequest> findByTrackingNumber(String trackingNumber);
}

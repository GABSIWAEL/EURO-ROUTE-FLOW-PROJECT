package com.euroroute.controller;

import com.euroroute.dto.DeliveryRequestDTO;
import com.euroroute.service.DeliveryRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/delivery-requests")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:3000" }, allowCredentials = "true")
public class DeliveryRequestController {

    @Autowired
    private DeliveryRequestService deliveryRequestService;

    @PostMapping
    public ResponseEntity<DeliveryRequestDTO> createDeliveryRequest(@RequestBody DeliveryRequestDTO dto) {
        return ResponseEntity.ok(deliveryRequestService.createDeliveryRequest(dto));
    }

    @GetMapping
    public ResponseEntity<List<DeliveryRequestDTO>> getAllDeliveryRequests() {
        return ResponseEntity.ok(deliveryRequestService.getAllDeliveryRequests());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeliveryRequestDTO> getDeliveryRequest(@PathVariable String id) {
        return ResponseEntity.ok(deliveryRequestService.getDeliveryRequest(id));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<DeliveryRequestDTO>> getDeliveryRequestsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(deliveryRequestService.getDeliveryRequestsByStatus(status));
    }

    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<DeliveryRequestDTO>> getDeliveryRequestsByDriver(@PathVariable String driverId) {
        return ResponseEntity.ok(deliveryRequestService.getDeliveryRequestsByDriver(driverId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DeliveryRequestDTO> updateDeliveryRequest(
            @PathVariable String id,
            @RequestBody DeliveryRequestDTO dto) {
        return ResponseEntity.ok(deliveryRequestService.updateDeliveryRequest(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDeliveryRequest(@PathVariable String id) {
        deliveryRequestService.deleteDeliveryRequest(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/confirm-delivery/{trackingNumber}")
    public ResponseEntity<DeliveryRequestDTO> confirmDelivery(@PathVariable String trackingNumber) {
        return ResponseEntity.ok(deliveryRequestService.markDeliveryAsDelivered(trackingNumber));
    }
}

package com.euroroute.controller;

import com.euroroute.dto.ContactMessageDTO;
import com.euroroute.service.ContactMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:3000" }, allowCredentials = "true")
public class ContactController {

    @Autowired
    private ContactMessageService contactMessageService;

    @PostMapping("/contact")
    public ResponseEntity<ContactMessageDTO> createMessage(@RequestBody ContactMessageDTO dto) {
        return ResponseEntity.ok(contactMessageService.createMessage(dto));
    }

    @GetMapping("/admin/messages")
    public ResponseEntity<List<ContactMessageDTO>> getAllMessages() {
        return ResponseEntity.ok(contactMessageService.getAllMessages());
    }

    @GetMapping("/admin/messages/unread")
    public ResponseEntity<List<ContactMessageDTO>> getUnreadMessages() {
        return ResponseEntity.ok(contactMessageService.getUnreadMessages());
    }

    @GetMapping("/admin/messages/{id}")
    public ResponseEntity<ContactMessageDTO> getMessage(@PathVariable String id) {
        return ResponseEntity.ok(contactMessageService.getMessage(id));
    }

    @PatchMapping("/admin/messages/{id}/read")
    public ResponseEntity<ContactMessageDTO> markAsRead(@PathVariable String id) {
        return ResponseEntity.ok(contactMessageService.markAsRead(id));
    }

    @PatchMapping("/admin/messages/{id}/respond")
    public ResponseEntity<ContactMessageDTO> respondToMessage(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {
        String responseText = request.get("responseText");
        return ResponseEntity.ok(contactMessageService.respondToMessage(id, responseText));
    }

    @DeleteMapping("/admin/messages/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable String id) {
        contactMessageService.deleteMessage(id);
        return ResponseEntity.ok().build();
    }
}

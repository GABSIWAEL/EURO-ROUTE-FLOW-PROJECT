package com.euroroute.service;

import com.euroroute.dto.ContactMessageDTO;
import com.euroroute.entity.ContactMessage;
import com.euroroute.repository.ContactMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContactMessageService {

    @Autowired
    private ContactMessageRepository contactMessageRepository;

    public ContactMessageDTO createMessage(ContactMessageDTO dto) {
        ContactMessage message = ContactMessage.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .subject(dto.getSubject())
                .message(dto.getMessage())
                .isRead(false)
                .build();

        ContactMessage saved = contactMessageRepository.save(message);
        return convertToDTO(saved);
    }

    public List<ContactMessageDTO> getAllMessages() {
        return contactMessageRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ContactMessageDTO> getUnreadMessages() {
        return contactMessageRepository.findByIsRead(false).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ContactMessageDTO getMessage(String id) {
        return contactMessageRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Message not found"));
    }

    public ContactMessageDTO markAsRead(String id) {
        ContactMessage message = contactMessageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        message.setRead(true);
        ContactMessage updated = contactMessageRepository.save(message);
        return convertToDTO(updated);
    }

    public void deleteMessage(String id) {
        contactMessageRepository.deleteById(id);
    }

    public ContactMessageDTO respondToMessage(String id, String responseText) {
        ContactMessage message = contactMessageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        message.setResponse(responseText);
        message.setRead(true);
        ContactMessage updated = contactMessageRepository.save(message);
        return convertToDTO(updated);
    }

    private ContactMessageDTO convertToDTO(ContactMessage message) {
        return ContactMessageDTO.builder()
                .id(message.getId())
                .name(message.getName())
                .email(message.getEmail())
                .subject(message.getSubject())
                .message(message.getMessage())
                .isRead(message.isRead())
                .response(message.getResponse())
                .createdAt(message.getCreatedAt())
                .build();
    }
}

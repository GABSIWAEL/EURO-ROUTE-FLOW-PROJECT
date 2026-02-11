package com.euroroute.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateUserRequest {
    private String email;
    private String password;
    private String fullName;
    private String role; // "DRIVER" or "ADMIN" or "STAFF"
    private String phone; // Optional, required if role is DRIVER
}


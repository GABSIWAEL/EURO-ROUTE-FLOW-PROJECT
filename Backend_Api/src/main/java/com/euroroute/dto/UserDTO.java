package com.euroroute.dto;

import lombok.*;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private String id;
    private String email;
    private String fullName;
    private String role;
    private boolean isActive;
    private Date createdAt;
}

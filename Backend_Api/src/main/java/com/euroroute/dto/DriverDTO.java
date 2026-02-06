package com.euroroute.dto;

import lombok.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverDTO {
    private String id;
    private String fullName;
    private String phone;
    private String email;
    @JsonProperty("isActive")
    private boolean isActive;
    private String vehicleInfo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

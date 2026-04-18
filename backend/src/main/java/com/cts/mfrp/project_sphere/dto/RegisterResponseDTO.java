package com.cts.mfrp.project_sphere.dto;

import com.cts.mfrp.project_sphere.Enum.Role;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterResponseDTO {
    private Long employeeId;
    private String email;
    private Role role;
    private Boolean isActive;
}
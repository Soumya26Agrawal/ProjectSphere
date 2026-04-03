package com.cts.mfrp.project_sphere.dto;

import com.cts.mfrp.project_sphere.Enum.Role;
import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProManagerResponseDTO {

    private Long userId;
    private Long employeeId;
    private String firstName;
    private String lastName;
    private String email;
    private Long phoneNumber;
    private String role;
    private Boolean isActive;

    // References the standalone DTO instead of an inner class
    private List<ManagedProjectDTO> managedProjects;
}

package com.cts.mfrp.project_sphere.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TeamMemberResponseDTO {
    private Long userId;
    private Long employeeId;
    private String firstName;
    private String lastName;
    private String email;
    private Long phoneNumber;
    private String role;
    private Boolean isActive;
}

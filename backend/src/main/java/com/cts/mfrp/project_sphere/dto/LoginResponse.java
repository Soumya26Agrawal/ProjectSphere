package com.cts.mfrp.project_sphere.dto;

import com.cts.mfrp.project_sphere.Enum.Role;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {
    private String message;
    private String token;
    private Long userId;
    private Long employeeId;   // added
    private String firstName;
    private String lastName;
    private String email;
    private Long phoneNumber;  // added
    private Role role;
}
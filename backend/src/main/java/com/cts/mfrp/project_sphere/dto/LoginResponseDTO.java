package com.cts.mfrp.project_sphere.dto;

import com.cts.mfrp.project_sphere.Enum.Role;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponseDTO {

    private String token;
    private String message;
    private Long userId;
    private String email;
    private String firstName;
    private String lastName;
    private Role role;
}

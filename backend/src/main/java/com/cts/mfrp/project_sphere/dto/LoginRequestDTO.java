package com.cts.mfrp.project_sphere.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LoginRequestDTO {
    private String email;
    private String password;
}

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
}
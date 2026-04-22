package com.cts.mfrp.project_sphere.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateUserRequestDTO {
    private String firstName;
    private String lastName;
    private String email;
    private Long phoneNumber;
    private Boolean isActive;
}

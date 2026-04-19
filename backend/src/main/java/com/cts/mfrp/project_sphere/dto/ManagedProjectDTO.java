package com.cts.mfrp.project_sphere.dto;


import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ManagedProjectDTO {
    private Long projectId;
    private String projectName;
    private String status;
}
package com.cts.mfrp.project_sphere.dto;

import com.cts.mfrp.project_sphere.Enum.Domain;
import com.cts.mfrp.project_sphere.Enum.ProjectStatus;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreateProjectRequestDTO {
    private String projectName;
    private String description;
    private ProjectStatus status;
    private Domain domain;
    private Long managerId;
}

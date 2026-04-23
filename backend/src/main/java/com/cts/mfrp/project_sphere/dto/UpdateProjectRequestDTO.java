package com.cts.mfrp.project_sphere.dto;

import com.cts.mfrp.project_sphere.Enum.Domain;
import com.cts.mfrp.project_sphere.Enum.ProjectStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProjectRequestDTO {
    private String projectName;
    private String description;
    private ProjectStatus status;
    private Domain domain;
    private Long managerId;
}

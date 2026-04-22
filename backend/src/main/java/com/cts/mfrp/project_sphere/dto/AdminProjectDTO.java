package com.cts.mfrp.project_sphere.dto;

import com.cts.mfrp.project_sphere.Enum.Domain;
import com.cts.mfrp.project_sphere.Enum.ProjectStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminProjectDTO {
    private Long projectId;
    private String projectName;
    private String description;
    private ProjectStatus status;
    private Domain domain;
    private Long managerId;
    private String managerName;
    private int teamSize;
    private List<String> memberInitials;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    /** Days between createdAt and completedAt (or now if still ongoing). Null when createdAt is unknown. */
    private Long durationDays;
}

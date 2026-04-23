package com.cts.mfrp.project_sphere.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AdminStatsDTO {
    private long projectManagers;
    private long teamMembers;
    private long teams;
    private long ongoingProjects;
    private long completedProjects;
}

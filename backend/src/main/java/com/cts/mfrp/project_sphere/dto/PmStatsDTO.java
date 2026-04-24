package com.cts.mfrp.project_sphere.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Simple counts shown on the Project Manager dashboard.
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PmStatsDTO {
    private long myProjects;
    private long ongoingProjects;
    private long completedProjects;
    private long teamMembers;
}

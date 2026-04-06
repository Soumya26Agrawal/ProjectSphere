package com.cts.mfrp.project_sphere.dto;

import com.cts.mfrp.project_sphere.Enum.Domain;
import com.cts.mfrp.project_sphere.Enum.ProjectStatus;
import com.cts.mfrp.project_sphere.Enum.TimelineContext;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class ProjectFilterRequestDTO {

    private String search; // project name or PRJ-id/id

    // Multi-select filters
    private List<ProjectStatus> statuses; // IN_PROGRESS, COMPLETED
    private List<Domain> domains;
    private List<Long> managerIds;
    private List<Long> teamMemberIds;

    // Timeline filter
    private TimelineContext timelineContext; // STARTED, ENDED, ACTIVE
    private LocalDate fromDate; // optional
    private LocalDate toDate;   // optional

    // Completion slider
    private Integer completionMin; // 0..100
    private Integer completionMax; // 0..100
}

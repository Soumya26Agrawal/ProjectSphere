package com.cts.mfrp.project_sphere.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class ProjectBasicInfoDTO {
    private Long projectId;
    private String title;
    private String description;
    private Long managerId;      // userId of manager
    private Long teamId;         // team id
    private List<Long> userIds;  // users in team
}

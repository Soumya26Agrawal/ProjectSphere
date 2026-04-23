package com.cts.mfrp.project_sphere.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProjectTeamRequestDTO {
    private String teamName;
    private Long projectId;
    private List<Long> userIds;
    private Long scrumMasterId;
}

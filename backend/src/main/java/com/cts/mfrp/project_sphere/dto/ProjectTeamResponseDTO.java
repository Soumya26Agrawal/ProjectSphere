package com.cts.mfrp.project_sphere.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectTeamResponseDTO {
    private Long teamId;
    private Long projectId;
    private String projectName;
    private List<TeamMemberDTO> members;
    private int memberCount;
}

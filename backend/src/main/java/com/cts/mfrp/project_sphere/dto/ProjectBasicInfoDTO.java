package com.cts.mfrp.project_sphere.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class ProjectBasicInfoDTO {
    private Long projectId;
    private String projectName;   
    private String description;
    private String status;        
    private String domain;        
    private Long managerId;       
    private Long teamId;          
    private List<Long> userIds;  
}

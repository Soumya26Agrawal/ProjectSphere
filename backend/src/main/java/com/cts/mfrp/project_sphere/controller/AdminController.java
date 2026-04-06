package com.cts.mfrp.project_sphere.controller;

import com.cts.mfrp.project_sphere.dto.ProManagerResponseDTO;
import com.cts.mfrp.project_sphere.dto.ProjectBasicInfoDTO;
import com.cts.mfrp.project_sphere.dto.ProjectFilterRequestDTO;
import com.cts.mfrp.project_sphere.model.Project;
import com.cts.mfrp.project_sphere.model.ProjectTeam;
import com.cts.mfrp.project_sphere.service.ProjectService;
import com.cts.mfrp.project_sphere.service.ProjectTeamService;
import com.cts.mfrp.project_sphere.service.UserService;
import com.cts.mfrp.project_sphere.utils.UserUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {
    @Autowired
    private UserService userService;

    @Autowired
    private ProjectService projectService;

    @Autowired
    private ProjectTeamService projectTeamService;

    @GetMapping
    public String homePage(){
        return "Admin DashBoard";
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadExcel(@RequestParam MultipartFile file){
        if(UserUtil.checkExcelFormat(file)){
            userService.save(file);
            return ResponseEntity.status(HttpStatus.OK).body("File uploaded successfully");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Upload in correct excel format");
    }

    @GetMapping("/getProjectManagers")
    public ResponseEntity<List<ProManagerResponseDTO>> getAllProjectManagers() {
        List<ProManagerResponseDTO> projectManagers = userService.getAllProjectManagers();
        return ResponseEntity.status(HttpStatus.OK).body(projectManagers);
    }

    @PostMapping("/projects/filter")
    public ResponseEntity<List<ProjectBasicInfoDTO>> filterProjects(@RequestBody(required = false) ProjectFilterRequestDTO filter) {
        List<ProjectBasicInfoDTO> result = projectService.filterProjects(filter).stream()
                .map(project -> {
                    Optional<ProjectTeam> teamOpt = projectTeamService.getProjectTeamByProjectId(project.getProjectId());
                    Long teamId = teamOpt.map(ProjectTeam::getTeamId).orElse(null);

                    return ProjectBasicInfoDTO.builder()
                            .projectId(project.getProjectId())
                            .title(project.getProjectName())
                            .description(project.getDescription())
                            .managerId(project.getManager() != null ? project.getManager().getUserId() : null)
                            .teamId(teamId)
                            .userIds(List.of()) 
                            .build();
                })
                .toList();

        return ResponseEntity.ok(result);
    }
}

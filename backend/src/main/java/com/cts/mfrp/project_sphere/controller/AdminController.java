package com.cts.mfrp.project_sphere.controller;

import com.cts.mfrp.project_sphere.dto.*;
import com.cts.mfrp.project_sphere.model.User;
import com.cts.mfrp.project_sphere.service.ProjectService;
import com.cts.mfrp.project_sphere.service.ProjectTeamService;
import com.cts.mfrp.project_sphere.service.UserService;
import com.cts.mfrp.project_sphere.utils.UserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final UserUtil userUtil;
    private final ProjectService projectService;

    private final ProjectTeamService projectTeamService;

    @GetMapping
    public String homePage(){
        return "Admin DashBoard";
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadExcel(@RequestParam MultipartFile file){
        if(userUtil.checkExcelFormat(file)){
            userService.registerViaExcelUpload(file);
            return ResponseEntity.status(HttpStatus.OK).body("File uploaded successfully");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Upload in correct excel format");
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponseDTO> register(@RequestBody RegisterRequestDTO request) {
        User user=userService.register(request);
        RegisterResponseDTO dto=RegisterResponseDTO.builder()
                .employeeId(user.getEmployeeId())
                .role(user.getRole())
                .email(user.getEmail())
                .isActive(user.getIsActive())
                 .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
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
                    Long teamId = projectTeamService.getProjectTeamByProjectId(project.getProjectId())
                            .map(ProjectTeamResponseDTO::getTeamId).orElse(null);

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

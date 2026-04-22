package com.cts.mfrp.project_sphere.controller;

import com.cts.mfrp.project_sphere.Enum.ProjectStatus;
import com.cts.mfrp.project_sphere.Enum.Role;
import com.cts.mfrp.project_sphere.dto.*;
import com.cts.mfrp.project_sphere.model.Project;
import com.cts.mfrp.project_sphere.model.User;
import com.cts.mfrp.project_sphere.repository.UserRepository;
import com.cts.mfrp.project_sphere.service.ProjectService;
import com.cts.mfrp.project_sphere.service.ProjectTeamService;
import com.cts.mfrp.project_sphere.service.UserService;
import com.cts.mfrp.project_sphere.utils.UserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final UserUtil userUtil;
    private final ProjectService projectService;
    private final ProjectTeamService projectTeamService;
    private final UserRepository userRepository;

    @GetMapping
    public String homePage(){
        return "Admin DashBoard";
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDTO> getStats() {
        AdminStatsDTO stats = AdminStatsDTO.builder()
                .projectManagers(userService.countByRole(Role.PROJECT_MANAGER))
                .teamMembers(userService.countByRole(Role.DEVELOPER))
                .teams(projectTeamService.countTeams())
                .ongoingProjects(projectService.countByStatus(ProjectStatus.IN_PROGRESS))
                .completedProjects(projectService.countByStatus(ProjectStatus.COMPLETED))
                .build();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/teams")
    public ResponseEntity<Page<ProjectTeamResponseDTO>> listTeams(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "teamId"));
        return ResponseEntity.ok(projectTeamService.getAllProjectTeamsPaged(pageable));
    }

    @GetMapping("/teams/{id}")
    public ResponseEntity<?> getTeam(@PathVariable Long id) {
        return projectTeamService.getProjectTeamById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("Team not found"));
    }

    @PostMapping("/teams")
    public ResponseEntity<?> createTeam(@RequestBody ProjectTeamRequestDTO req) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(projectTeamService.createProjectTeam(req));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/teams/{id}")
    public ResponseEntity<?> updateTeam(@PathVariable Long id,
                                        @RequestBody ProjectTeamRequestDTO req) {
        try {
            return ResponseEntity.ok(projectTeamService.updateProjectTeam(id, req));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/teamMembers")
    public ResponseEntity<Page<TeamMemberResponseDTO>> getAllTeamMembers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "userId"));
        return ResponseEntity.ok(userService.getAllTeamMembersPaged(pageable));
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
    public ResponseEntity<Page<ProManagerResponseDTO>> getAllProjectManagers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "userId"));
        return ResponseEntity.ok(userService.getAllProjectManagersPaged(pageable));
    }

    @GetMapping("/projects")
    public ResponseEntity<Page<AdminProjectDTO>> listProjects(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "projectId"));
        return ResponseEntity.ok(projectService.findAllAsAdminDTOPaged(pageable));
    }

    @GetMapping("/projects/{id}")
    public ResponseEntity<?> getProject(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(projectService.findByIdAsAdminDTO(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PutMapping("/projects/{id}")
    public ResponseEntity<?> updateProject(@PathVariable Long id,
                                           @RequestBody UpdateProjectRequestDTO req) {
        try {
            return ResponseEntity.ok(projectService.updateFromDTO(id, req));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(userService.getUserDTO(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id,
                                        @RequestBody UpdateUserRequestDTO req) {
        try {
            return ResponseEntity.ok(userService.updateUserFromDTO(id, req));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/projects")
    public ResponseEntity<?> createProject(@RequestBody CreateProjectRequestDTO req) {
        if (req.getProjectName() == null || req.getProjectName().isBlank()) {
            return ResponseEntity.badRequest().body("Project name is required");
        }
        if (req.getStatus() == null || req.getDomain() == null) {
            return ResponseEntity.badRequest().body("Status and domain are required");
        }
        User manager = null;
        if (req.getManagerId() != null) {
            manager = userRepository.findById(req.getManagerId())
                    .orElse(null);
            if (manager == null) {
                return ResponseEntity.badRequest().body("Manager not found");
            }
        }
        Project project = Project.builder()
                .projectName(req.getProjectName())
                .description(req.getDescription())
                .status(req.getStatus())
                .domain(req.getDomain())
                .manager(manager)
                .build();
        Project saved = projectService.create(project);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved.getProjectId());
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

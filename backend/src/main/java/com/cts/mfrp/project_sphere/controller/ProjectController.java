package com.cts.mfrp.project_sphere.controller;

import com.cts.mfrp.project_sphere.dto.AdminProjectDTO;
import com.cts.mfrp.project_sphere.dto.CreateProjectRequestDTO;
import com.cts.mfrp.project_sphere.dto.PmStatsDTO;
import com.cts.mfrp.project_sphere.dto.TeamMemberResponseDTO;
import com.cts.mfrp.project_sphere.dto.UpdateProjectRequestDTO;
import com.cts.mfrp.project_sphere.model.Project;
import com.cts.mfrp.project_sphere.service.ProjectService;
import com.cts.mfrp.project_sphere.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/projects")
@CrossOrigin(origins = "http://localhost:4200")
public class ProjectController {

    private final ProjectService projectService;
    private final UserService userService;

    public ProjectController(ProjectService projectService, UserService userService) {
        this.projectService = projectService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<Project>> getAllProjects() {
        List<Project> projects = projectService.findAll();
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable Long id) {
        return projectService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Project> createProject(@RequestBody Project project) {
        if (project == null || project.getProjectName() == null || project.getProjectName().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        Project created = projectService.create(project);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Project> updateProject(@PathVariable Long id, @RequestBody Project updatedProject) {
        return projectService.update(id, updatedProject)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        if (projectService.findById(id).isPresent()) {
            projectService.delete(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/count")
    public ResponseEntity<Long> countProjects() {
        long count = projectService.count();
        return ResponseEntity.ok(count);
    }



    // Projects that a particular manager owns, paginated and sorted newest first.
    @GetMapping("/by-manager/{managerId}")
    public ResponseEntity<Page<AdminProjectDTO>> getByManager(
            @PathVariable Long managerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "projectId"));
        Page<AdminProjectDTO> result = projectService.findByManagerAsAdminDTOPaged(managerId, pageable);
        return ResponseEntity.ok(result);
    }

    // Counts shown on the PM dashboard: my projects, ongoing, completed, total members.
    @GetMapping("/stats/by-manager/{managerId}")
    public ResponseEntity<PmStatsDTO> getStatsByManager(@PathVariable Long managerId) {
        PmStatsDTO stats = projectService.getPmStats(managerId);
        return ResponseEntity.ok(stats);
    }


    // Get a project in the "admin DTO" shape (with manager name, team size, etc.).
    @GetMapping("/dto/{id}")
    public ResponseEntity<?> getProjectDTO(@PathVariable Long id) {
        try {
            AdminProjectDTO dto = projectService.findByIdAsAdminDTO(id);
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // Create a project from a simple JSON body (the manager id is taken from the body).
    @PostMapping("/dto")
    public ResponseEntity<?> createProjectDTO(@RequestBody CreateProjectRequestDTO req) {
        try {
            AdminProjectDTO dto = projectService.createFromDTO(req);
            return ResponseEntity.status(HttpStatus.CREATED).body(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Update an existing project from a partial JSON body.
    @PutMapping("/dto/{id}")
    public ResponseEntity<?> updateProjectDTO(@PathVariable Long id,
                                               @RequestBody UpdateProjectRequestDTO req) {
        try {
            AdminProjectDTO dto = projectService.updateFromDTO(id, req);
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Full list of developers — used by the PM team-creation page
    // to populate the member picker.
    @GetMapping("/developers")
    public ResponseEntity<List<TeamMemberResponseDTO>> getDevelopers() {
        return ResponseEntity.ok(userService.getAllTeamMembers());
    }
}

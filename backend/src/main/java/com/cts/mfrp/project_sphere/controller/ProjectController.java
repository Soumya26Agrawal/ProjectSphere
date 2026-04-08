package com.cts.mfrp.project_sphere.controller;

import com.cts.mfrp.project_sphere.dto.ProjectBasicInfoDTO;
import com.cts.mfrp.project_sphere.model.Project;
import com.cts.mfrp.project_sphere.service.ProjectService;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("api/projects")
@CrossOrigin(origins = "http://localhost:4200")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public ResponseEntity<Page<ProjectBasicInfoDTO>> getAllProjects( @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "16") int size) {
        Page<ProjectBasicInfoDTO> projects = projectService.findAll(page, size);
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
}


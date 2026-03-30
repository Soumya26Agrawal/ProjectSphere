package com.cts.mfrp.project_sphere.controller;

import com.cts.mfrp.project_sphere.model.ProjectTeam;
import com.cts.mfrp.project_sphere.repository.ProjectTeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/project-teams")
public class ProjectTeamController {

    private final ProjectTeamRepository projectTeamRepository;

    @Autowired
    public ProjectTeamController(ProjectTeamRepository projectTeamRepository) {
        this.projectTeamRepository = projectTeamRepository;
    }

    @GetMapping
    public List<ProjectTeam> getAll() {
        return projectTeamRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectTeam> getById(@PathVariable Long id) {
        return projectTeamRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/project/{projectId}")
    public List<ProjectTeam> getByProject(@PathVariable Long projectId) {
        return projectTeamRepository.findByProjectProjectId(projectId);
    }

    @GetMapping("/employee/{employeeId}")
    public List<ProjectTeam> getByEmployee(@PathVariable Long employeeId) {
        return projectTeamRepository.findByUserEmployeeId(employeeId);
    }

    @PostMapping
    public ResponseEntity<ProjectTeam> create(@RequestBody ProjectTeam projectTeam) {
        ProjectTeam saved = projectTeamRepository.save(projectTeam);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectTeam> update(@PathVariable Long id,
                                              @RequestBody ProjectTeam projectTeam) {
        return projectTeamRepository.findById(id)
                .map(existing -> {
                    existing.setProject(projectTeam.getProject());
                    existing.setUser(projectTeam.getUser());
                    existing.setProjectRole(projectTeam.getProjectRole());
                    ProjectTeam updated = projectTeamRepository.save(existing);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return projectTeamRepository.findById(id)
                .map(found -> {
                    projectTeamRepository.delete(found);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}


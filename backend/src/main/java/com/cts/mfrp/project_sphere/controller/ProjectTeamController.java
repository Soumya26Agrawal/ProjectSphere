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
    public ResponseEntity<ProjectTeam> getById(@PathVariable Integer id) {
        return projectTeamRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/project/{projectId}")
    public List<ProjectTeam> getByProject(@PathVariable String projectId) {
        return projectTeamRepository.findByProjectId(projectId);
    }

    @GetMapping("/employee/{employeeId}")
    public List<ProjectTeam> getByEmployee(@PathVariable String employeeId) {
        return projectTeamRepository.findByEmployeeId(employeeId);
    }

    @PostMapping
    public ResponseEntity<ProjectTeam> create(@RequestBody ProjectTeam projectTeam) {
        ProjectTeam saved = projectTeamRepository.save(projectTeam);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectTeam> update(@PathVariable Integer id,
                                              @RequestBody ProjectTeam projectTeam) {
        return projectTeamRepository.findById(id)
                .map(existing -> {
                    existing.setProjectId(projectTeam.getProjectId());
                    existing.setEmployeeId(projectTeam.getEmployeeId());
                    existing.setProjectRole(projectTeam.getProjectRole());
                    ProjectTeam updated = projectTeamRepository.save(existing);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        return projectTeamRepository.findById(id)
                .map(found -> {
                    projectTeamRepository.delete(found);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}


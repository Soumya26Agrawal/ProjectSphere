package com.cts.mfrp.project_sphere.controller;
import com.cts.mfrp.project_sphere.model.ProjectTeam;
import com.cts.mfrp.project_sphere.service.ProjectTeamService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/project-teams")
public class ProjectTeamController {
    private final ProjectTeamService projectTeamService;
    // Constructor Injection
    public ProjectTeamController(ProjectTeamService projectTeamService) {
        this.projectTeamService = projectTeamService;
    }
    //  GET ALL
    @GetMapping
    public List<ProjectTeam> getAll() {
        return projectTeamService.getAllProjectTeams();
    }
    // GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<ProjectTeam> getById(@PathVariable Long id) {
        return projectTeamRepository.findById(id)
        return projectTeamService.getProjectTeamById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    //  GET BY PROJECT ID (One-to-One relation)
    @GetMapping("/project/{projectId}")
    public List<ProjectTeam> getByProject(@PathVariable Long projectId) {
        return projectTeamRepository.findByProjectProjectId(projectId);
    }

    @GetMapping("/employee/{employeeId}")
    public List<ProjectTeam> getByEmployee(@PathVariable Long employeeId) {
        return projectTeamRepository.findByUserEmployeeId(employeeId);
    public ResponseEntity<ProjectTeam> getByProject(@PathVariable String projectId) {
        return projectTeamService.getProjectTeamByProjectId(projectId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // CREATE
    @PostMapping
    public ProjectTeam create(@RequestBody ProjectTeam projectTeam) {
        return projectTeamService.createProjectTeam(projectTeam);
    }
    // UPDATE
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
                                              @RequestBody ProjectTeam newData) {
        try {
            ProjectTeam updated = projectTeamService.updateProjectTeam(id, newData);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            projectTeamService.deleteProjectTeam(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

}
 
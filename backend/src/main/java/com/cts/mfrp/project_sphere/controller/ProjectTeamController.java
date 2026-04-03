package com.cts.mfrp.project_sphere.controller;
import com.cts.mfrp.project_sphere.model.ProjectTeam;
import com.cts.mfrp.project_sphere.service.ProjectTeamService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("api//project-teams")
public class ProjectTeamController {
    private final ProjectTeamService projectTeamService;
    public ProjectTeamController(ProjectTeamService projectTeamService) {
        this.projectTeamService = projectTeamService;
    }
    @GetMapping
    public List<ProjectTeam> getAll() {
        return projectTeamService.getAllProjectTeams();
    }
    @GetMapping("/{id}")
    public ResponseEntity<ProjectTeam> getById(@PathVariable Long id) {
        return projectTeamService.getProjectTeamById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    @GetMapping("/project/{projectId}")
    public ResponseEntity<ProjectTeam> getByProject(@PathVariable Long projectId) {
        return projectTeamService.getProjectTeamByProjectId(projectId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    @PostMapping
    public ProjectTeam create(@RequestBody ProjectTeam projectTeam) {
        return projectTeamService.createProjectTeam(projectTeam);
    }
    @PutMapping("/{id}")
    public ResponseEntity<ProjectTeam> update(@PathVariable Long id,
                                              @RequestBody ProjectTeam newData) {
        try {
            ProjectTeam updated = projectTeamService.updateProjectTeam(id, newData);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
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

package com.cts.mfrp.project_sphere.controller;

import com.cts.mfrp.project_sphere.dto.AddMembersRequestDTO;
import com.cts.mfrp.project_sphere.dto.ProjectTeamRequestDTO;
import com.cts.mfrp.project_sphere.dto.ProjectTeamResponseDTO;
import com.cts.mfrp.project_sphere.dto.TeamMemberDTO;
import com.cts.mfrp.project_sphere.service.ProjectTeamService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/project-teams")
public class ProjectTeamController {

    private final ProjectTeamService projectTeamService;

    public ProjectTeamController(ProjectTeamService projectTeamService) {
        this.projectTeamService = projectTeamService;
    }

    @GetMapping
    public ResponseEntity<List<ProjectTeamResponseDTO>> getAll() {
        return ResponseEntity.ok(projectTeamService.getAllProjectTeams());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectTeamResponseDTO> getById(@PathVariable Long id) {
        return projectTeamService.getProjectTeamById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<ProjectTeamResponseDTO> getByProject(@PathVariable Long projectId) {
        return projectTeamService.getProjectTeamByProjectId(projectId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ProjectTeamResponseDTO>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(projectTeamService.getTeamsByUserId(userId));
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<TeamMemberDTO>> getMembers(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(projectTeamService.getTeamMembers(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/members/count")
    public ResponseEntity<Integer> getMemberCount(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(projectTeamService.getMemberCount(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/project/{projectId}/membership/{userId}")
    public ResponseEntity<Boolean> checkMembership(@PathVariable Long projectId,
                                                    @PathVariable Long userId) {
        return ResponseEntity.ok(projectTeamService.isUserInTeam(projectId, userId));
    }

    @PostMapping
    public ResponseEntity<ProjectTeamResponseDTO> create(@RequestBody ProjectTeamRequestDTO request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(projectTeamService.createProjectTeam(request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectTeamResponseDTO> update(@PathVariable Long id,
                                                          @RequestBody ProjectTeamRequestDTO request) {
        try {
            return ResponseEntity.ok(projectTeamService.updateProjectTeam(id, request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<ProjectTeamResponseDTO> addMembers(@PathVariable Long id,
                                                              @RequestBody AddMembersRequestDTO request) {
        try {
            return ResponseEntity.ok(projectTeamService.addMembers(id, request.getUserIds()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<ProjectTeamResponseDTO> removeMember(@PathVariable Long id,
                                                                @PathVariable Long userId) {
        try {
            return ResponseEntity.ok(projectTeamService.removeMember(id, userId));
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

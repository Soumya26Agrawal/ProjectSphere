package com.cts.mfrp.project_sphere.controller;

import com.cts.mfrp.project_sphere.model.Sprint;
import com.cts.mfrp.project_sphere.service.SprintService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/sprints")

public class SprintController {

    private final SprintService sprintService;

    public SprintController(SprintService sprintService) {
        this.sprintService = sprintService;
    }

    @GetMapping
    public ResponseEntity<List<Sprint>> getAllSprints() {
        List<Sprint> sprints = sprintService.findAll();
        return ResponseEntity.ok(sprints);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sprint> getSprintById(@PathVariable Long id) {
        return sprintService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Sprint>> getSprintsByProjectId(@PathVariable Long projectId) {
        List<Sprint> sprints = sprintService.findByProjectId(projectId);
        return ResponseEntity.ok(sprints);  // Returns empty list if no sprints
    }

    @PostMapping
    public ResponseEntity<Sprint> createSprint(@RequestBody Sprint sprint, @RequestParam Long projectId) {
        if (sprint == null || sprint.getSprintName() == null || sprint.getSprintName().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return sprintService.create(sprint, projectId)
                .map(created -> ResponseEntity.status(HttpStatus.CREATED).body(created))
                .orElse(ResponseEntity.badRequest().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Sprint> updateSprint(@PathVariable Long id, @RequestBody Sprint updatedSprint) {
        return sprintService.update(id, updatedSprint)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSprint(@PathVariable Long id) {
        if (sprintService.findById(id).isPresent()) {
            sprintService.delete(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}


package com.cts.mfrp.project_sphere.controller;

import com.cts.mfrp.project_sphere.model.Sprint;
import com.cts.mfrp.project_sphere.service.SprintService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sprints")
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
    public ResponseEntity<Sprint> getSprintById(@PathVariable Integer id) {
        return sprintService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Sprint>> getSprintsByProjectId(@PathVariable String projectId) {
        List<Sprint> sprints = sprintService.findByProjectId(projectId);
        return ResponseEntity.ok(sprints);  // Returns empty list if no sprints
    }

    @PostMapping
    public ResponseEntity<Sprint> createSprint(@RequestBody Sprint sprint, @RequestParam String projectId) {
        if (sprint == null || sprint.getSprintName() == null || sprint.getSprintName().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return sprintService.create(sprint, projectId)
                .map(created -> ResponseEntity.status(HttpStatus.CREATED).body(created))
                .orElse(ResponseEntity.badRequest().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Sprint> updateSprint(@PathVariable Integer id, @RequestBody Sprint updatedSprint) {
        return sprintService.update(id, updatedSprint)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSprint(@PathVariable Integer id) {
        if (sprintService.findById(id).isPresent()) {
            sprintService.delete(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}


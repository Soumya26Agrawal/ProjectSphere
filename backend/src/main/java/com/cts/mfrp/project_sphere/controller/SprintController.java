package com.cts.mfrp.project_sphere.controller;

import com.cts.mfrp.project_sphere.model.Sprint;
import com.cts.mfrp.project_sphere.repository.SprintRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sprints")
@RequiredArgsConstructor
public class SprintController {

    private final SprintRepository sprintRepository;

    @GetMapping
    public List<Sprint> getAllSprints() {
        return sprintRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sprint> getSprintById(@PathVariable Long id) {
        return sprintRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/project/{projectId}")
    public List<Sprint> getSprintsByProjectId(@PathVariable Long projectId) {
        return sprintRepository.findByProjectProjectId(projectId);
    }

    @PostMapping
    public ResponseEntity<Sprint> createSprint(@RequestBody Sprint sprint) {
        if (sprint.getSprintName() == null || sprint.getSprintName().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        Sprint saved = sprintRepository.save(sprint);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Sprint> updateSprint(@PathVariable Long id, @RequestBody Sprint updated) {
        return sprintRepository.findById(id)
                .map(existing -> {
                    if(updated.getSprintName() != null) {
                        existing.setSprintName(updated.getSprintName());
                    }
                    if(updated.getProject() != null) {
                        existing.setProject(updated.getProject());
                    }
                    return ResponseEntity.ok(sprintRepository.save(existing));
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSprint(@PathVariable Long id) {
        if (sprintRepository.existsById(id)) {
            sprintRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}


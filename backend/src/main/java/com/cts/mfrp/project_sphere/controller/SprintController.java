package com.cts.mfrp.project_sphere.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/sprints")
public class SprintController {

    private final Map<Integer, Sprint> sprintStore = new ConcurrentHashMap<>();
    private final AtomicInteger sprintIdSequence = new AtomicInteger(0);

    @GetMapping
    public List<Sprint> getAllSprints() {
        return new ArrayList<>(sprintStore.values());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sprint> getSprintById(@PathVariable int id) {
        Sprint sprint = sprintStore.get(id);
        return sprint != null ? ResponseEntity.ok(sprint) : ResponseEntity.notFound().build();
    }

    @GetMapping("/project/{projectId}")
    public List<Sprint> getSprintsByProjectId(@PathVariable String projectId) {
        List<Sprint> result = new ArrayList<>();
        for (Sprint sprint : sprintStore.values()) {
            if (sprint.projectId() != null && sprint.projectId().equals(projectId)) {
                result.add(sprint);
            }
        }
        return result;
    }

    @PostMapping
    public ResponseEntity<Sprint> createSprint(@RequestBody Sprint sprint) {
        if (sprint == null || sprint.projectId() == null || sprint.projectId().isBlank() || sprint.sprintName() == null || sprint.sprintName().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        int id = sprintIdSequence.incrementAndGet();
        Sprint stored = new Sprint(id, sprint.projectId(), sprint.sprintName());
        sprintStore.put(id, stored);
        return ResponseEntity.status(HttpStatus.CREATED).body(stored);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Sprint> updateSprint(@PathVariable int id, @RequestBody Sprint updated) {
        Sprint existing = sprintStore.get(id);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }

        Sprint merged = new Sprint(id,
                Optional.ofNullable(updated.projectId()).orElse(existing.projectId()),
                Optional.ofNullable(updated.sprintName()).orElse(existing.sprintName()));

        sprintStore.put(id, merged);
        return ResponseEntity.ok(merged);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSprint(@PathVariable int id) {
        if (sprintStore.remove(id) != null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    public static record Sprint(int id, String projectId, String sprintName) {}
}


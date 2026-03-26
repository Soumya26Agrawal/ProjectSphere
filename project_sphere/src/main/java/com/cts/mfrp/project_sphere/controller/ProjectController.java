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
@RequestMapping("/projects")
public class ProjectController {

    private final Map<Integer, Project> projectStore = new ConcurrentHashMap<>();
    private final AtomicInteger projectIdSequence = new AtomicInteger(0);

    @GetMapping
    public List<Project> getAllProjects() {
        return new ArrayList<>(projectStore.values());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable int id) {
        Project project = projectStore.get(id);
        return project != null ? ResponseEntity.ok(project) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Project> createProject(@RequestBody Project project) {
        if (project == null || project.projectName() == null || project.projectName().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        int id = projectIdSequence.incrementAndGet();
        Project stored = new Project(id, project.projectId(), project.projectName(), project.projectManagerId());
        projectStore.put(id, stored);

        return ResponseEntity.status(HttpStatus.CREATED).body(stored);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Project> updateProject(@PathVariable int id, @RequestBody Project updated) {
        Project existing = projectStore.get(id);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }

        Project merged = new Project(id,
                Optional.ofNullable(updated.projectId()).orElse(existing.projectId()),
                Optional.ofNullable(updated.projectName()).orElse(existing.projectName()),
                Optional.ofNullable(updated.projectManagerId()).orElse(existing.projectManagerId()));

        projectStore.put(id, merged);
        return ResponseEntity.ok(merged);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable int id) {
        if (projectStore.remove(id) != null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/count")
    public int countProjects() {
        return projectStore.size();
    }

    public static record Project(int id, String projectId, String projectName, String projectManagerId) {
        public Project {
            if (projectId == null || projectId.isBlank()) {
                projectId = String.valueOf(id);
            }
        }
    }
}


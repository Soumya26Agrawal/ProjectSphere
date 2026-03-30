package com.cts.mfrp.project_sphere.service;

import com.cts.mfrp.project_sphere.model.Project;
import com.cts.mfrp.project_sphere.repository.ProjectRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    public List<Project> findAll() {
        return projectRepository.findAllWithSprints();
    }

    public Optional<Project> findById(String projectId) {
        return projectRepository.findByIdWithSprints(projectId);
    }

    @Transactional
    public Project create(Project project) {
        return projectRepository.save(project);
    }

    @Transactional
    public Optional<Project> update(String projectId, Project updated) {
        return projectRepository.findById(projectId)
                .map(existing -> {
                    existing.setProjectName(updated.getProjectName());
                    if (updated.getStatus() != null) {
                        existing.setStatus(updated.getStatus());
                    }
                    if (updated.getDomain() != null) {
                        existing.setDomain(updated.getDomain());
                    }
                    return existing;  // Automatically saved due to @Transactional
                });
    }

    @Transactional
    public void delete(String projectId) {
        projectRepository.deleteById(projectId);
        // CascadeType.ALL ensures all sprints are deleted
    }

    public long count() {
        return projectRepository.count();
    }
}

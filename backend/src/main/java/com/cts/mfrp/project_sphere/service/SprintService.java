package com.cts.mfrp.project_sphere.service;

import com.cts.mfrp.project_sphere.model.Sprint;
import com.cts.mfrp.project_sphere.repository.ProjectRepository;
import com.cts.mfrp.project_sphere.repository.SprintRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SprintService {

    private final SprintRepository sprintRepository;
    private final ProjectRepository projectRepository;

    public SprintService(SprintRepository sprintRepository, ProjectRepository projectRepository) {
        this.sprintRepository = sprintRepository;
        this.projectRepository = projectRepository;
    }

    public List<Sprint> findAll() {
        return sprintRepository.findAll();
    }

    public Optional<Sprint> findById(Integer sprintId) {
        return sprintRepository.findById(sprintId);
    }

    public List<Sprint> findByProjectId(Long projectId) {
        return sprintRepository.findByProjectProjectId(projectId);
    }

    @Transactional
    public Optional<Sprint> create(Sprint sprint, String projectId) {
        return projectRepository.findById(projectId)
                .map(project -> {
                    sprint.setProject(project);
                    return sprintRepository.save(sprint);
                });
    }

    @Transactional
    public Optional<Sprint> update(Integer sprintId, Sprint updated) {
        return sprintRepository.findById(sprintId)
                .map(existing -> {
                    existing.setSprintName(updated.getSprintName());
                    if (updated.getStatus() != null) {
                        existing.setStatus(updated.getStatus());
                    }
                    return sprintRepository.save(existing);
                });
    }

    @Transactional
    public void delete(Integer sprintId) {
        sprintRepository.deleteById(sprintId);
    }

    public long count() {
        return sprintRepository.count();
    }
}

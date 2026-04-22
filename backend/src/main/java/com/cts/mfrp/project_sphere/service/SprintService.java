package com.cts.mfrp.project_sphere.service;

import com.cts.mfrp.project_sphere.Enum.SprintStatus;
import com.cts.mfrp.project_sphere.dto.SprintRequestDTO;
import com.cts.mfrp.project_sphere.dto.SprintResponseDTO;
import com.cts.mfrp.project_sphere.model.Project;
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

    public Optional<Sprint> findById(Long sprintId) {
        return sprintRepository.findById(sprintId);
    }

    public List<Sprint> findByProjectId(Long projectId) {
        return sprintRepository.findByProjectProjectId(projectId);
    }

    @Transactional
    public Sprint create(SprintRequestDTO sprint, Long projectId) {
//        return projectRepository.findById(projectId)
//                .map(project -> {
//                    sprint.setProject(project);
//                    return sprintRepository.save(sprint);
//                });
        Sprint s=Sprint.builder().sprintName(sprint.getSprintName())
                .endDate(sprint.getEndDate())
                .startDate(sprint.getStartDate())
                .build();
        Project project=projectRepository.getReferenceById(projectId);
        s.setProject(project);
        return sprintRepository.save(s);

    }

    @Transactional
    public Optional<Sprint> update(Long sprintId, Sprint updated) {
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
    public void delete(Long sprintId) {
        sprintRepository.deleteById(sprintId);
    }

    public long count() {
        return sprintRepository.count();
    }



    public List<Long> getActiveSprints() {
        return sprintRepository.findActiveSprints(SprintStatus.ACTIVE);
    }
}

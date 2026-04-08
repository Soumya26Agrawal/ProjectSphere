package com.cts.mfrp.project_sphere.service;

import com.cts.mfrp.project_sphere.Enum.Domain;
import com.cts.mfrp.project_sphere.Enum.ProjectStatus;
import com.cts.mfrp.project_sphere.Enum.Status;
import com.cts.mfrp.project_sphere.dto.ProjectBasicInfoDTO;
import com.cts.mfrp.project_sphere.dto.ProjectFilterRequestDTO;
import com.cts.mfrp.project_sphere.model.Project;
import com.cts.mfrp.project_sphere.model.ProjectTeam;
import com.cts.mfrp.project_sphere.model.User;
import com.cts.mfrp.project_sphere.repository.ProjectRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectTeamService projectTeamService;

    public ProjectService(ProjectRepository projectRepository, ProjectTeamService projectTeamService) {
        this.projectRepository = projectRepository;
        this.projectTeamService = projectTeamService;
    }

    public Page<ProjectBasicInfoDTO> findAll(int page, int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "projectId"));
        Page<Project> projectPage = projectRepository.findAll(pageable);
        return projectPage.map(project -> convertToDto(project));
    }

    private ProjectBasicInfoDTO convertToDto(Project project) {
        String statusString = null;
        if (project.getStatus() != null) {
            statusString = project.getStatus().name();
        }

        String domainString = null;
        if (project.getDomain() != null) {
            domainString = project.getDomain().name();
        }

        Long managerId = null;
        if (project.getManager() != null) {
            managerId = project.getManager().getUserId();
        }

        Long teamId = null;
        List<Long> userIds = null;

        Optional<ProjectTeam> teamOpt = projectTeamService.getProjectTeamByProjectId(project.getProjectId());
        if (teamOpt.isPresent()) {
            ProjectTeam team = teamOpt.get();
            teamId = team.getTeamId();

            if (team.getUsers() != null) {
                userIds = new ArrayList<>();
                for (User user : team.getUsers()) {
                    if (user != null && user.getUserId() != null) {
                        userIds.add(user.getUserId());
                    }
                }
            }
        }

        return ProjectBasicInfoDTO.builder()
                .projectId(project.getProjectId())
                .projectName(project.getProjectName())
                .description(project.getDescription())
                .status(statusString)
                .domain(domainString)
                .managerId(managerId)
                .teamId(teamId)
                .userIds(userIds)
                .build();
    }

    public Optional<Project> findById(Long projectId) {
        return projectRepository.findById(projectId);
    }

    @Transactional
    public Project create(Project project) {
        return projectRepository.save(project);
    }

    @Transactional
    public Optional<Project> update(Long projectId, Project updated) {
        return projectRepository.findById(projectId)
                .map(existing -> {
                    existing.setProjectName(updated.getProjectName());
                    if (updated.getStatus() != null) {
                        existing.setStatus(updated.getStatus());
                    }
                    if (updated.getDomain() != null) {
                        existing.setDomain(updated.getDomain());
                    }
                    if (updated.getDescription() != null) {
                        existing.setDescription(updated.getDescription());
                    }
                    return existing;  // Automatically saved due to @Transactional
                });
    }

    @Transactional
    public void delete(Long projectId) {
        projectRepository.deleteById(projectId);
        // CascadeType.ALL ensures all sprints are deleted
    }

    public long count() {
        return projectRepository.count();
    }


    private List<String> toStatusNames(List<ProjectStatus> statuses) {
        if (statuses == null) return List.of();
        return statuses.stream().map(Enum::name).toList();
    }

    private List<String> toDomainNames(List<Domain> domains) {
        if (domains == null) return List.of();
        return domains.stream().map(Enum::name).toList();
    }

    private int completionPercent(Project project) {
        if (project.getTickets() == null || project.getTickets().isEmpty()) return 0;
        long total = project.getTickets().size();
        long completed = project.getTickets().stream()
                .filter(t -> t.getStatus() == Status.COMPLETED)
                .count();
        return (int) Math.round((completed * 100.0) / total);
    }

    private boolean hasText(String s) {
        return s != null && !s.trim().isEmpty();
    }

    private Long parseProjectId(String raw) {
        if (!hasText(raw)) return null;
        String value = raw.trim().toLowerCase();
        try {
            if (value.startsWith("prj-")) return Long.parseLong(value.substring(4));
            return Long.parseLong(value);
        } catch (Exception e) {
            return null;
        }
    }
}

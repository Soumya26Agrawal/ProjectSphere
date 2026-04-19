package com.cts.mfrp.project_sphere.service;

import com.cts.mfrp.project_sphere.Enum.Domain;
import com.cts.mfrp.project_sphere.Enum.ProjectStatus;
import com.cts.mfrp.project_sphere.Enum.Status;
import com.cts.mfrp.project_sphere.dto.ProjectFilterRequestDTO;
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
        return projectRepository.findAll();
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

    public List<Project> filterProjects(ProjectFilterRequestDTO filter) {
        if (filter == null) return projectRepository.findAll();

        String search = hasText(filter.getSearch()) ? filter.getSearch().trim() : null;
        Long searchId = parseProjectId(search);

        List<String> statuses = toStatusNames(filter.getStatuses());
        boolean statusesEmpty = statuses.isEmpty();
        if (statusesEmpty) statuses = List.of("__NONE__");

        List<String> domains = toDomainNames(filter.getDomains());
        boolean domainsEmpty = domains.isEmpty();
        if (domainsEmpty) domains = List.of("__NONE__");

        List<Long> managerIds = filter.getManagerIds() == null ? List.of() : filter.getManagerIds();
        boolean managerIdsEmpty = managerIds.isEmpty();
        if (managerIdsEmpty) managerIds = List.of(-1L);

        List<Long> teamMemberIds = filter.getTeamMemberIds() == null ? List.of() : filter.getTeamMemberIds();
        boolean teamMemberIdsEmpty = teamMemberIds.isEmpty();
        if (teamMemberIdsEmpty) teamMemberIds = List.of(-1L);

        String timelineContext = filter.getTimelineContext() == null ? null : filter.getTimelineContext().name();

        List<Project> dbFiltered = projectRepository.filterProjectsRaw(
                search, searchId,
                statuses, statusesEmpty,
                domains, domainsEmpty,
                managerIds, managerIdsEmpty,
                teamMemberIds, teamMemberIdsEmpty,
                timelineContext,
                filter.getFromDate(), filter.getToDate()
        );

        // completion slider filter in service
        Integer min = filter.getCompletionMin();
        Integer max = filter.getCompletionMax();
        if (min == null && max == null) return dbFiltered;

        int minVal = min == null ? 0 : Math.max(0, min);
        int maxVal = max == null ? 100 : Math.min(100, max);

        return dbFiltered.stream()
                .filter(p -> {
                    int c = completionPercent(p);
                    return c >= minVal && c <= maxVal;
                })
                .toList();
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

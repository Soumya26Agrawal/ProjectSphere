package com.cts.mfrp.project_sphere.service;

import com.cts.mfrp.project_sphere.Enum.Domain;
import com.cts.mfrp.project_sphere.Enum.ProjectStatus;
import com.cts.mfrp.project_sphere.Enum.Status;
import com.cts.mfrp.project_sphere.dto.AdminProjectDTO;
import com.cts.mfrp.project_sphere.dto.ProjectFilterRequestDTO;
import com.cts.mfrp.project_sphere.dto.UpdateProjectRequestDTO;
import com.cts.mfrp.project_sphere.model.Project;
import com.cts.mfrp.project_sphere.model.ProjectTeam;
import com.cts.mfrp.project_sphere.model.User;
import com.cts.mfrp.project_sphere.repository.ProjectRepository;
import com.cts.mfrp.project_sphere.repository.ProjectTeamRepository;
import com.cts.mfrp.project_sphere.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectTeamRepository projectTeamRepository;

    public ProjectService(ProjectRepository projectRepository,
                          UserRepository userRepository,
                          ProjectTeamRepository projectTeamRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.projectTeamRepository = projectTeamRepository;
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

    public long countByStatus(ProjectStatus status) {
        return projectRepository.findAll().stream()
                .filter(p -> p.getStatus() == status)
                .count();
    }

    public List<AdminProjectDTO> findAllAsAdminDTO() {
        return projectRepository.findAll().stream().map(this::toAdminProjectDTO).toList();
    }

    @Transactional
    public Page<AdminProjectDTO> findAllAsAdminDTOPaged(Pageable pageable) {
        return projectRepository.findAll(pageable).map(this::toAdminProjectDTO);
    }

    public AdminProjectDTO findByIdAsAdminDTO(Long id) {
        return projectRepository.findById(id).map(this::toAdminProjectDTO)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
    }

    @Transactional
    public AdminProjectDTO updateFromDTO(Long id, UpdateProjectRequestDTO req) {
        Project p = projectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        if (req.getProjectName() != null) p.setProjectName(req.getProjectName());
        if (req.getDescription() != null) p.setDescription(req.getDescription());
        if (req.getStatus()      != null) {
            ProjectStatus prev = p.getStatus();
            p.setStatus(req.getStatus());
            // Stamp completedAt the first time status flips to COMPLETED;
            // clear it if the project is reopened.
            if (req.getStatus() == ProjectStatus.COMPLETED && prev != ProjectStatus.COMPLETED) {
                p.setCompletedAt(LocalDateTime.now());
            } else if (req.getStatus() != ProjectStatus.COMPLETED) {
                p.setCompletedAt(null);
            }
        }
        if (req.getDomain()      != null) p.setDomain(req.getDomain());
        if (req.getManagerId()   != null) {
            User m = userRepository.findById(req.getManagerId()).orElse(null);
            p.setManager(m);
        }
        return toAdminProjectDTO(p);
    }

    private AdminProjectDTO toAdminProjectDTO(Project p) {
        User mgr = p.getManager();
        String mgrName = mgr == null ? null :
                (safe(mgr.getFirstName()) + " " + safe(mgr.getLastName())).trim();

        int teamSize = 0;
        java.util.List<String> initials = java.util.List.of();
        try {
            ProjectTeam team = projectTeamRepository.findByProject_ProjectId(p.getProjectId());
            if (team != null && team.getUsers() != null) {
                teamSize = team.getUsers().size();
                initials = team.getUsers().stream()
                        .limit(4)
                        .map(u -> {
                            String a = safe(u.getFirstName());
                            String b = safe(u.getLastName());
                            String s = (a.isEmpty() ? "" : a.substring(0, 1))
                                     + (b.isEmpty() ? "" : b.substring(0, 1));
                            return s.isEmpty() ? "?" : s.toUpperCase();
                        })
                        .toList();
            }
        } catch (Exception ignored) { /* LIE guard */ }

        Long durationDays = null;
        if (p.getCreatedAt() != null) {
            LocalDateTime end = p.getCompletedAt() != null ? p.getCompletedAt() : LocalDateTime.now();
            durationDays = ChronoUnit.DAYS.between(p.getCreatedAt(), end);
        }

        return AdminProjectDTO.builder()
                .projectId(p.getProjectId())
                .projectName(p.getProjectName())
                .description(p.getDescription())
                .status(p.getStatus())
                .domain(p.getDomain())
                .managerId(mgr != null ? mgr.getUserId() : null)
                .managerName(mgrName == null || mgrName.isEmpty() ? null : mgrName)
                .teamSize(teamSize)
                .memberInitials(initials)
                .createdAt(p.getCreatedAt())
                .completedAt(p.getCompletedAt())
                .durationDays(durationDays)
                .build();
    }

    private String safe(String s) { return s == null ? "" : s; }

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

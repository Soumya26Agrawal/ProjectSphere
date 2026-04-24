package com.cts.mfrp.project_sphere.service;

import com.cts.mfrp.project_sphere.Enum.ProjectStatus;
import com.cts.mfrp.project_sphere.dto.AdminProjectDTO;
import com.cts.mfrp.project_sphere.dto.CreateProjectRequestDTO;
import com.cts.mfrp.project_sphere.dto.PmStatsDTO;
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
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

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

    /* ── PM-scoped helpers ──────────────────────────────────────────── */

    // Paginated list of projects that belong to a given manager.
    @Transactional
    public Page<AdminProjectDTO> findByManagerAsAdminDTOPaged(Long managerId, Pageable pageable) {
        Page<Project> page = projectRepository.findByManager_UserId(managerId, pageable);
        return page.map(this::toAdminProjectDTO);
    }

    // Dashboard counts for one Project Manager.
    @Transactional
    public PmStatsDTO getPmStats(Long managerId) {
        List<Project> myProjects = projectRepository.findByManager_UserId(managerId);

        long ongoing = 0;
        long completed = 0;
        Set<Long> memberIds = new HashSet<>();

        for (Project project : myProjects) {
            if (project.getStatus() == ProjectStatus.IN_PROGRESS) {
                ongoing++;
            } else if (project.getStatus() == ProjectStatus.COMPLETED) {
                completed++;
            }

            ProjectTeam team = projectTeamRepository.findByProject_ProjectId(project.getProjectId());
            if (team != null && team.getUsers() != null) {
                for (User user : team.getUsers()) {
                    memberIds.add(user.getUserId());
                }
            }
        }

        PmStatsDTO stats = new PmStatsDTO();
        stats.setMyProjects(myProjects.size());
        stats.setOngoingProjects(ongoing);
        stats.setCompletedProjects(completed);
        stats.setTeamMembers(memberIds.size());
        return stats;
    }

    // Create a project from a simple request DTO and return the admin DTO view.
    @Transactional
    public AdminProjectDTO createFromDTO(CreateProjectRequestDTO req) {
        if (req.getProjectName() == null || req.getProjectName().isBlank()) {
            throw new IllegalArgumentException("Project name is required");
        }
        if (req.getStatus() == null || req.getDomain() == null) {
            throw new IllegalArgumentException("Status and domain are required");
        }

        User manager = null;
        if (req.getManagerId() != null) {
            manager = userRepository.findById(req.getManagerId())
                    .orElseThrow(() -> new IllegalArgumentException("Manager not found"));
        }

        Project project = new Project();
        project.setProjectName(req.getProjectName());
        project.setDescription(req.getDescription());
        project.setStatus(req.getStatus());
        project.setDomain(req.getDomain());
        project.setManager(manager);

        Project saved = projectRepository.save(project);
        return toAdminProjectDTO(saved);
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
}

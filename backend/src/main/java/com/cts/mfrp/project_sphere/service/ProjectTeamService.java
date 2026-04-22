package com.cts.mfrp.project_sphere.service;

import com.cts.mfrp.project_sphere.dto.ProjectTeamRequestDTO;
import com.cts.mfrp.project_sphere.dto.ProjectTeamResponseDTO;
import com.cts.mfrp.project_sphere.dto.TeamMemberDTO;
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

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ProjectTeamService {

    private final ProjectTeamRepository projectTeamRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ProjectTeamService(ProjectTeamRepository projectTeamRepository,
                              ProjectRepository projectRepository,
                              UserRepository userRepository) {
        this.projectTeamRepository = projectTeamRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    private TeamMemberDTO toMemberDTO(User user) {
        return TeamMemberDTO.builder()
                .userId(user.getUserId())
                .employeeId(user.getEmployeeId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .build();
    }

    private ProjectTeamResponseDTO toResponseDTO(ProjectTeam team) {
        List<TeamMemberDTO> members = team.getUsers().stream()
                .map(this::toMemberDTO)
                .toList();
        User sm = team.getScrumMaster();
        String smName = sm == null ? null :
                ((sm.getFirstName() == null ? "" : sm.getFirstName()) + " "
                 + (sm.getLastName() == null ? "" : sm.getLastName())).trim();
        return ProjectTeamResponseDTO.builder()
                .teamId(team.getTeamId())
                .teamName(team.getTeamName())
                .projectId(team.getProject() != null ? team.getProject().getProjectId() : null)
                .projectName(team.getProject() != null ? team.getProject().getProjectName() : null)
                .projectStatus(team.getProject() != null && team.getProject().getStatus() != null
                        ? team.getProject().getStatus().name() : null)
                .scrumMasterId(sm != null ? sm.getUserId() : null)
                .scrumMasterName(smName == null || smName.isEmpty() ? null : smName)
                .members(members)
                .memberCount(members.size())
                .build();
    }

    public List<ProjectTeamResponseDTO> getAllProjectTeams() {
        return projectTeamRepository.findAll().stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Transactional
    public Page<ProjectTeamResponseDTO> getAllProjectTeamsPaged(Pageable pageable) {
        return projectTeamRepository.findAll(pageable).map(this::toResponseDTO);
    }

    public long countTeams() {
        return projectTeamRepository.count();
    }

    public Optional<ProjectTeamResponseDTO> getProjectTeamById(Long id) {
        return projectTeamRepository.findById(id)
                .map(this::toResponseDTO);
    }

    public Optional<ProjectTeamResponseDTO> getProjectTeamByProjectId(Long projectId) {
        return Optional.ofNullable(projectTeamRepository.findByProject_ProjectId(projectId))
                .map(this::toResponseDTO);
    }

    public List<ProjectTeamResponseDTO> getTeamsByUserId(Long userId) {
        return projectTeamRepository.findByUsers_UserId(userId).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public List<TeamMemberDTO> getTeamMembers(Long teamId) {
        ProjectTeam team = projectTeamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found: " + teamId));
        return team.getUsers().stream().map(this::toMemberDTO).toList();
    }

    public int getMemberCount(Long teamId) {
        ProjectTeam team = projectTeamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found: " + teamId));
        return team.getUsers().size();
    }

    public boolean isUserInTeam(Long projectId, Long userId) {
        return projectTeamRepository.existsByProject_ProjectIdAndUsers_UserId(projectId, userId);
    }

    @Transactional
    public ProjectTeamResponseDTO createProjectTeam(ProjectTeamRequestDTO request) {
        if (request.getTeamName() == null || request.getTeamName().isBlank()) {
            throw new IllegalArgumentException("Team name is required");
        }
        if (request.getProjectId() == null) {
            throw new IllegalArgumentException("Project is required");
        }

        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + request.getProjectId()));

        // Rule: a project can have only one team
        if (projectTeamRepository.existsByProject_ProjectId(request.getProjectId())) {
            throw new IllegalStateException("A team already exists for project: " + request.getProjectId());
        }

        List<Long> userIds = request.getUserIds() == null ? List.of() : request.getUserIds();

        // Rule: a user/developer can be in only one team
        for (Long uid : userIds) {
            List<ProjectTeam> existingTeams = projectTeamRepository.findByUsers_UserId(uid);
            if (!existingTeams.isEmpty()) {
                throw new IllegalArgumentException("User " + uid + " is already in another team");
            }
        }

        List<User> users = userIds.isEmpty() ? new ArrayList<>() : userRepository.findAllById(userIds);

        User scrumMaster = null;
        if (request.getScrumMasterId() != null) {
            scrumMaster = userRepository.findById(request.getScrumMasterId())
                    .orElseThrow(() -> new IllegalArgumentException("Scrum master not found: " + request.getScrumMasterId()));
            if (!userIds.contains(scrumMaster.getUserId())) {
                throw new IllegalArgumentException("Scrum master must also be a team member");
            }
        }

        ProjectTeam team = ProjectTeam.builder()
                .teamName(request.getTeamName().trim())
                .project(project)
                .users(users)
                .scrumMaster(scrumMaster)
                .build();

        return toResponseDTO(projectTeamRepository.save(team));
    }

    @Transactional
    public ProjectTeamResponseDTO updateProjectTeam(Long id, ProjectTeamRequestDTO request) {
        ProjectTeam existing = projectTeamRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Team not found: " + id));

        if (request.getTeamName() != null && !request.getTeamName().isBlank()) {
            existing.setTeamName(request.getTeamName().trim());
        }

        if (request.getProjectId() != null &&
                (existing.getProject() == null ||
                 !existing.getProject().getProjectId().equals(request.getProjectId()))) {
            // Rule: a project can have only one team
            if (projectTeamRepository.existsByProject_ProjectId(request.getProjectId())) {
                throw new IllegalStateException("A team already exists for project: " + request.getProjectId());
            }
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new IllegalArgumentException("Project not found: " + request.getProjectId()));
            existing.setProject(project);
        }

        if (request.getUserIds() != null) {
            // Rule: each user can be in only one team
            for (Long uid : request.getUserIds()) {
                List<ProjectTeam> otherTeams = projectTeamRepository.findByUsers_UserId(uid).stream()
                        .filter(t -> !t.getTeamId().equals(existing.getTeamId()))
                        .toList();
                if (!otherTeams.isEmpty()) {
                    throw new IllegalArgumentException("User " + uid + " is already in another team");
                }
            }
            List<User> users = request.getUserIds().isEmpty()
                    ? new ArrayList<>()
                    : userRepository.findAllById(request.getUserIds());
            existing.setUsers(users);

            // if current scrum master is no longer a member, clear the reference
            if (existing.getScrumMaster() != null &&
                users.stream().noneMatch(u -> u.getUserId().equals(existing.getScrumMaster().getUserId()))) {
                existing.setScrumMaster(null);
            }
        }

        if (request.getScrumMasterId() == null) {
            existing.setScrumMaster(null);
        } else {
            User sm = userRepository.findById(request.getScrumMasterId())
                    .orElseThrow(() -> new IllegalArgumentException("Scrum master not found: " + request.getScrumMasterId()));
            boolean inTeam = existing.getUsers().stream()
                    .anyMatch(u -> u.getUserId().equals(sm.getUserId()));
            if (!inTeam) {
                throw new IllegalArgumentException("Scrum master must also be a team member");
            }
            existing.setScrumMaster(sm);
        }

        return toResponseDTO(projectTeamRepository.save(existing));
    }

    @Transactional
    public ProjectTeamResponseDTO addMembers(Long teamId, List<Long> userIds) {
        ProjectTeam team = projectTeamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found: " + teamId));

        List<Long> existingIds = team.getUsers().stream().map(User::getUserId).toList();
        for (Long uid : userIds) {
            if (existingIds.contains(uid)) continue;
            List<ProjectTeam> otherTeams = projectTeamRepository.findByUsers_UserId(uid);
            if (!otherTeams.isEmpty()) {
                throw new IllegalArgumentException("User " + uid + " is already in another team");
            }
        }

        List<User> toAdd = userRepository.findAllById(userIds).stream()
                .filter(u -> !existingIds.contains(u.getUserId()))
                .toList();

        team.getUsers().addAll(toAdd);
        return toResponseDTO(projectTeamRepository.save(team));
    }

    @Transactional
    public ProjectTeamResponseDTO removeMember(Long teamId, Long userId) {
        ProjectTeam team = projectTeamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found: " + teamId));

        boolean removed = team.getUsers().removeIf(u -> u.getUserId().equals(userId));
        if (!removed) {
            throw new IllegalArgumentException("User " + userId + " is not a member of team " + teamId);
        }
        // if the scrum master was removed, clear the reference
        if (team.getScrumMaster() != null && team.getScrumMaster().getUserId().equals(userId)) {
            team.setScrumMaster(null);
        }

        return toResponseDTO(projectTeamRepository.save(team));
    }

    @Transactional
    public void deleteProjectTeam(Long id) {
        if (!projectTeamRepository.existsById(id)) {
            throw new IllegalArgumentException("Team not found: " + id);
        }
        projectTeamRepository.deleteById(id);
    }
}

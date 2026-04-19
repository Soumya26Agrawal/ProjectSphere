package com.cts.mfrp.project_sphere.service;

import com.cts.mfrp.project_sphere.dto.AddMembersRequestDTO;
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
        return ProjectTeamResponseDTO.builder()
                .teamId(team.getTeamId())
                .projectId(team.getProject().getProjectId())
                .projectName(team.getProject().getProjectName())
                .members(members)
                .memberCount(members.size())
                .build();
    }

    public List<ProjectTeamResponseDTO> getAllProjectTeams() {
        return projectTeamRepository.findAll().stream()
                .map(this::toResponseDTO)
                .toList();
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
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + request.getProjectId()));

        if (projectTeamRepository.existsByProject_ProjectId(request.getProjectId())) {
            throw new IllegalStateException("A team already exists for project: " + request.getProjectId());
        }

        List<User> users = new ArrayList<>();
        if (request.getUserIds() != null && !request.getUserIds().isEmpty()) {
            users = userRepository.findAllById(request.getUserIds());
        }

        ProjectTeam team = ProjectTeam.builder()
                .project(project)
                .users(users)
                .build();

        return toResponseDTO(projectTeamRepository.save(team));
    }

    @Transactional
    public ProjectTeamResponseDTO updateProjectTeam(Long id, ProjectTeamRequestDTO request) {
        ProjectTeam existing = projectTeamRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Team not found: " + id));

        if (request.getProjectId() != null &&
                !existing.getProject().getProjectId().equals(request.getProjectId())) {
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new IllegalArgumentException("Project not found: " + request.getProjectId()));
            existing.setProject(project);
        }

        if (request.getUserIds() != null) {
            List<User> users = userRepository.findAllById(request.getUserIds());
            existing.setUsers(users);
        }

        return toResponseDTO(projectTeamRepository.save(existing));
    }

    @Transactional
    public ProjectTeamResponseDTO addMembers(Long teamId, List<Long> userIds) {
        ProjectTeam team = projectTeamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found: " + teamId));

        List<Long> existingIds = team.getUsers().stream().map(User::getUserId).toList();
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

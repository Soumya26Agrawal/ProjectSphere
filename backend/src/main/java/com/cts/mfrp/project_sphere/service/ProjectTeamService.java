package com.cts.mfrp.project_sphere.service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.cts.mfrp.project_sphere.model.ProjectTeam;
import com.cts.mfrp.project_sphere.repository.ProjectTeamRepository;
import java.util.List;
import java.util.Optional;
@Service
public class ProjectTeamService {
    @Autowired
    private ProjectTeamRepository projectTeamRepository;
    // Get all project teams
    public List<ProjectTeam> getAllProjectTeams() {
        return projectTeamRepository.findAll();
    }
    // Get project team by ID
    public Optional<ProjectTeam> getProjectTeamById(Long id) {
        return projectTeamRepository.findById(id);
    }
    // Get project team by project ID
    public Optional<ProjectTeam> getProjectTeamByProjectId(String projectId) {
        ProjectTeam team = projectTeamRepository.findByProjectId_ProjectId(projectId);
        return Optional.ofNullable(team);
    }
    // Create a new project team
    public ProjectTeam createProjectTeam(ProjectTeam projectTeam) {
        // Add validation if needed (e.g., check if project already has a team)
        return projectTeamRepository.save(projectTeam);
    }
    // Update an existing project team
    public ProjectTeam updateProjectTeam(Long id, ProjectTeam updatedProjectTeam) {
        ProjectTeam existingTeam = projectTeamRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Project team not found with id: " + id));

        existingTeam.setProjectId(updatedProjectTeam.getProjectId());
        existingTeam.setUsers(updatedProjectTeam.getUsers());

        return projectTeamRepository.save(existingTeam);
    }
    // Delete a project team
    public void deleteProjectTeam(Long id) {
        if (!projectTeamRepository.existsById(id)) {
            throw new IllegalArgumentException("Project team not found with id: " + id);
        }
        projectTeamRepository.deleteById(id);
    }
}

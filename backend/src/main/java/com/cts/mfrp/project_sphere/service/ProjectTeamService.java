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
    public List<ProjectTeam> getAllProjectTeams() {
        return projectTeamRepository.findAll();
    }
    public Optional<ProjectTeam> getProjectTeamById(Long id) {
        return projectTeamRepository.findById(id);
    }
    public Optional<ProjectTeam> getProjectTeamByProjectId(String projectId) {
        ProjectTeam team = projectTeamRepository.findByProjectId_ProjectId(projectId);
        return Optional.ofNullable(team);
    }
    public ProjectTeam createProjectTeam(ProjectTeam projectTeam) {
        return projectTeamRepository.save(projectTeam);
    }
    public ProjectTeam updateProjectTeam(Long id, ProjectTeam updatedProjectTeam) {
        ProjectTeam existingTeam = projectTeamRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Project team not found with id: " + id));

        existingTeam.setProjectId(updatedProjectTeam.getProjectId());
        existingTeam.setUsers(updatedProjectTeam.getUsers());

        return projectTeamRepository.save(existingTeam);
    }
    public void deleteProjectTeam(Long id) {
        if (!projectTeamRepository.existsById(id)) {
            throw new IllegalArgumentException("Project team not found with id: " + id);
        }
        projectTeamRepository.deleteById(id);
    }
}

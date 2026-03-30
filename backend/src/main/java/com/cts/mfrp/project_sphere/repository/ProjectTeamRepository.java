package com.cts.mfrp.project_sphere.repository;
import com.cts.mfrp.project_sphere.model.ProjectTeam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface ProjectTeamRepository extends JpaRepository<ProjectTeam, Long> {
    ProjectTeam findByProjectId_ProjectId(String projectId);
}
 
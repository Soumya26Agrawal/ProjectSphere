package com.cts.mfrp.project_sphere.repository;

import com.cts.mfrp.project_sphere.model.ProjectTeam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectTeamRepository extends JpaRepository<ProjectTeam, Long> {

    ProjectTeam findByProject_ProjectId(Long projectId);

    List<ProjectTeam> findByUsers_UserId(Long userId);

    boolean existsByProject_ProjectIdAndUsers_UserId(Long projectId, Long userId);

    boolean existsByProject_ProjectId(Long projectId);
}

package com.cts.mfrp.project_sphere.repository;

import com.cts.mfrp.project_sphere.model.ProjectTeam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectTeamRepository extends JpaRepository<ProjectTeam, Long> {
    
    List<ProjectTeam> findByProjectProjectId(Long projectId);
    
    List<ProjectTeam> findByUserEmployeeId(Long employeeId);

}


package com.cts.mfrp.project_sphere.repository;

import com.cts.mfrp.project_sphere.model.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    // Used by the Project Manager dashboard
    List<Project> findByManager_UserId(Long managerId);
    Page<Project> findByManager_UserId(Long managerId, Pageable pageable);

}
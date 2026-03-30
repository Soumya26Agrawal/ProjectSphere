package com.cts.mfrp.project_sphere.repository;

import com.cts.mfrp.project_sphere.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
}

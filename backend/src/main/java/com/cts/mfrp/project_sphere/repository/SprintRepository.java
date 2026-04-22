package com.cts.mfrp.project_sphere.repository;

import com.cts.mfrp.project_sphere.Enum.SprintStatus;
import com.cts.mfrp.project_sphere.model.Sprint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SprintRepository extends JpaRepository<Sprint, Long> {
    List<Sprint> findByProjectProjectId(Long projectId);

    @Query("select s.sprintId from Sprint s where s.status=:status")
    List<Long> findActiveSprints(@Param("status") SprintStatus status);
}

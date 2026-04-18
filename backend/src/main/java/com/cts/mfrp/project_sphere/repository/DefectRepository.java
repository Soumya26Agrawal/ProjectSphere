package com.cts.mfrp.project_sphere.repository;

import com.cts.mfrp.project_sphere.model.Defect;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface DefectRepository extends JpaRepository<Defect,Long> {


}

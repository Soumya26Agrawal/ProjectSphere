package com.cts.mfrp.project_sphere.repository;

import com.cts.mfrp.project_sphere.model.TestCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.RequestMapping;

@Repository
public interface TestCaseRepository extends JpaRepository<TestCase,Long> {
}

package com.cts.mfrp.project_sphere.repository;
import org.springframework.data.jpa.repository.Query;
import com.cts.mfrp.project_sphere.model.TestCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.RequestMapping;
import java.util.List;

@Repository
public interface TestCaseRepository extends JpaRepository<TestCase,Long> {

    @Query("select t.testCaseId from TestCase t where t.defect is null")
    public List<Long> getUnMappedTestCases();
}

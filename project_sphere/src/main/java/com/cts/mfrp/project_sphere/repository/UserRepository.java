package com.cts.mfrp.project_sphere.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.cts.mfrp.project_sphere.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmployeeId(Long employeeId);
}

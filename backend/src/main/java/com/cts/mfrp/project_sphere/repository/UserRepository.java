package com.cts.mfrp.project_sphere.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.cts.mfrp.project_sphere.model.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmployeeId(Long employeeId);
    Optional<User> findByEmail(String email);
}

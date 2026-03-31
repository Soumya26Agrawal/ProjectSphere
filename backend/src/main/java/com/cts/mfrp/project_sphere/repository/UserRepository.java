package com.cts.mfrp.project_sphere.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.cts.mfrp.project_sphere.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmployeeId(Long employeeId);
    Optional<User> findByEmailAndIsActiveTrue(String email);
    Optional<User> findByEmail(String email);
}
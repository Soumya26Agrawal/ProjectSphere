package com.cts.mfrp.project_sphere.repository;

import java.util.List;
import java.util.Optional;

import com.cts.mfrp.project_sphere.Enum.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import com.cts.mfrp.project_sphere.model.User;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmployeeId(Long employeeId);
    Optional<User> findByEmailAndIsActiveTrue(String email);
    Optional<User> findByEmail(String email);
    List<User> findByRole(Role role);
    Page<User> findByRole(Role role, Pageable pageable);
}
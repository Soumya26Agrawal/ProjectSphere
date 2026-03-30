package com.cts.mfrp.project_sphere.repository;

import com.cts.mfrp.project_sphere.model.TicketComment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<TicketComment, Integer> {
}

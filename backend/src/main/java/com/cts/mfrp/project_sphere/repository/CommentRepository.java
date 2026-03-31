package com.cts.mfrp.project_sphere.repository;

import com.cts.mfrp.project_sphere.model.TicketComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentRepository extends JpaRepository<TicketComment, Long> {}

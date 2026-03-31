package com.cts.mfrp.project_sphere.repository;

import com.cts.mfrp.project_sphere.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByUser_UserId(Long userId);
    List<Comment> findByTicket_TicketId(Long ticketId);
}
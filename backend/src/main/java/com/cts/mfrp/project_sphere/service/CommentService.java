package com.cts.mfrp.project_sphere.service;

import com.cts.mfrp.project_sphere.model.Comment;
import com.cts.mfrp.project_sphere.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    public List<Comment> getAllComments() {
        return commentRepository.findAll();
    }

    public Optional<Comment> getCommentById(Long id) {
        return commentRepository.findById(id);
    }

    public Comment createComment(Comment comment) {
        return commentRepository.save(comment);
    }

    public Optional<Comment> updateComment(Long id, Comment updatedComment) {
        return commentRepository.findById(id).map(existing -> {
            existing.setCommentBody(updatedComment.getCommentBody());
            existing.setCreatedAt(updatedComment.getCreatedAt());
            existing.setTicket(updatedComment.getTicket());
            existing.setUser(updatedComment.getUser());
            return commentRepository.save(existing);
        });
    }

    public boolean deleteComment(Long id) {
        return commentRepository.findById(id).map(existing -> {
            commentRepository.delete(existing);
            return true;
        }).orElse(false);
    }

    public List<Comment> getCommentsByUser(Long userId) {
        return commentRepository.findByUser_UserId(userId);
    }

    public List<Comment> getCommentsByTicket(Long ticketId) {
        return commentRepository.findByTicket_TicketId(ticketId);
    }
}



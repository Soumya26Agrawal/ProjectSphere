package com.cts.mfrp.project_sphere.controller;

import com.cts.mfrp.project_sphere.model.TicketComment;
import com.cts.mfrp.project_sphere.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

public class CommentController
{
    @Autowired
    private CommentRepository commentRepository;

    @GetMapping
    public List<TicketComment> getAllComments() {
        return commentRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketComment> getCommentById(@PathVariable Integer id) {
        return commentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public TicketComment createComment(@RequestBody TicketComment comment) {
        return commentRepository.save(comment);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TicketComment> updateComment(@PathVariable Integer id,
                                                       @RequestBody TicketComment updatedComment) {
        return commentRepository.findById(id)
                .map(existing -> {
                    existing.setCommentBody(updatedComment.getCommentBody());
                    existing.setCreatedAt(updatedComment.getCreatedAt());
                    existing.setTicket(updatedComment.getTicket());
                    existing.setUser(updatedComment.getUser());
                    return ResponseEntity.ok(commentRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteComment(@PathVariable Integer id) {
        return commentRepository.findById(id)
                .map(existing -> {
                    commentRepository.delete(existing);
                    return ResponseEntity.<Void>noContent().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }


}


package com.cts.mfrp.project_sphere.controller;

import com.cts.mfrp.project_sphere.model.Comment;
import com.cts.mfrp.project_sphere.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @GetMapping
    public List<Comment> getAllComments() {
        return commentService.getAllComments();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Comment> getCommentById(@PathVariable Long id) {
        Optional<Comment> comment = commentService.getCommentById(id);
        return comment.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Comment createComment(@RequestBody Comment comment) {
        return commentService.createComment(comment);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Comment> updateComment(@PathVariable Long id,
                                                 @RequestBody Comment updatedComment) {
        Optional<Comment> updated = commentService.updateComment(id, updatedComment);
        return updated.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        boolean deleted = commentService.deleteComment(id);
        return deleted ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    @GetMapping("/user/{userId}")
    public List<Comment> getCommentsByUser(@PathVariable Long userId) {
        return commentService.getCommentsByUser(userId);
    }

    @GetMapping("/ticket/{ticketId}")
    public List<Comment> getCommentsByTicket(@PathVariable Long ticketId) {
        return commentService.getCommentsByTicket(ticketId);
    }
}
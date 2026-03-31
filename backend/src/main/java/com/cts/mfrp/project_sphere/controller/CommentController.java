package com.cts.mfrp.project_sphere.controller;

import com.cts.mfrp.project_sphere.model.TicketComment;
import com.cts.mfrp.project_sphere.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
public class CommentController
{
    @Autowired
    private CommentRepository commentRepository;

    @GetMapping
    public List<TicketComment> getAllComments() {
        return commentRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketComment> getCommentById(@PathVariable Long id) {
        return commentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<TicketComment> createComment(@RequestBody TicketComment comment) {
        TicketComment savedComment = commentRepository.save(comment);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedComment);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TicketComment> updateComment(@PathVariable Long id,
                                                       @RequestBody TicketComment updatedComment) {
        return commentRepository.findById(id)
                .map(existing -> {
                    existing.setCommentBody(updatedComment.getCommentBody());
                    existing.setTicket(updatedComment.getTicket());
                    existing.setUser(updatedComment.getUser());
                    return ResponseEntity.ok(commentRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        if (commentRepository.existsById(id)) {
            commentRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}


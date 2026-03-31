package com.cts.mfrp.project_sphere.controller;

import com.cts.mfrp.project_sphere.model.Attachment;
import com.cts.mfrp.project_sphere.service.AttachmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/attachments")
public class AttachmentController {

    @Autowired
    private AttachmentService attachmentService;

    @GetMapping
    public List<Attachment> getAllAttachments() {
        return attachmentService.getAllAttachments();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Attachment> getAttachmentById(@PathVariable Long id) {
        Optional<Attachment> attachment = attachmentService.getAttachmentById(id);
        return attachment.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Attachment createAttachment(@RequestBody Attachment attachment) {
        return attachmentService.createAttachment(attachment);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Attachment> updateAttachment(@PathVariable Long id,
                                                       @RequestBody Attachment updatedAttachment) {
        Optional<Attachment> updated = attachmentService.updateAttachment(id, updatedAttachment);
        return updated.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttachment(@PathVariable Long id) {
        boolean deleted = attachmentService.deleteAttachment(id);
        return deleted ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    @GetMapping("/ticket/{ticketId}")
    public List<Attachment> getAttachmentsByTicket(@PathVariable Long ticketId) {
        return attachmentService.getAttachmentsByTicket(ticketId);
    }
}
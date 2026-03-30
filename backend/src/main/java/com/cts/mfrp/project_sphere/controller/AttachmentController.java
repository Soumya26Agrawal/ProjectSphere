package com.cts.mfrp.project_sphere.controller;

import com.cts.mfrp.project_sphere.model.Attachment;
import com.cts.mfrp.project_sphere.repository.AttachmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attachments")
public class AttachmentController
{
    @Autowired
    private AttachmentRepository attachmentRepository;

    @GetMapping
    public List<Attachment> getAllAttachments() {
        return attachmentRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Attachment> getAttachmentById(@PathVariable Long id) {
        return attachmentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Attachment> createAttachment(@RequestBody Attachment attachment) {
        Attachment savedAttachment = attachmentRepository.save(attachment);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedAttachment);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Attachment> updateAttachment(@PathVariable Long id,
                                                       @RequestBody Attachment updatedAttachment) {
        return attachmentRepository.findById(id)
                .map(existing -> {
                    existing.setFileUrl(updatedAttachment.getFileUrl());
                    existing.setUploadedAt(updatedAttachment.getUploadedAt());
                    existing.setTicket(updatedAttachment.getTicket());
                    return ResponseEntity.ok(attachmentRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttachment(@PathVariable Long id) {
        if (attachmentRepository.existsById(id)) {
            attachmentRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

}

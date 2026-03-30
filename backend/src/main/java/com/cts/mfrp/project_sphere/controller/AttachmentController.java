package com.cts.mfrp.project_sphere.controller;

import com.cts.mfrp.project_sphere.model.Attachment;
import com.cts.mfrp.project_sphere.repository.AttachmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

public class AttachmentController
{
    @Autowired
    private AttachmentRepository attachmentRepository;

    @GetMapping
    public List<Attachment> getAllAttachments() {
        return attachmentRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Attachment> getAttachmentById(@PathVariable Integer id) {
        return attachmentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Attachment createAttachment(@RequestBody Attachment attachment) {
        return attachmentRepository.save(attachment);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Attachment> updateAttachment(@PathVariable Integer id,
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
    public ResponseEntity<?> deleteAttachment(@PathVariable Integer id) {
        return attachmentRepository.findById(id)
                .map(existing -> {
                    attachmentRepository.delete(existing);
                    return ResponseEntity.noContent().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

}

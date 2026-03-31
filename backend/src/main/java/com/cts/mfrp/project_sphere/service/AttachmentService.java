package com.cts.mfrp.project_sphere.service;

import com.cts.mfrp.project_sphere.model.Attachment;
import com.cts.mfrp.project_sphere.repository.AttachmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AttachmentService {

    @Autowired
    private AttachmentRepository attachmentRepository;

    public List<Attachment> getAllAttachments() {
        return attachmentRepository.findAll();
    }

    public Optional<Attachment> getAttachmentById(Long id) {
        return attachmentRepository.findById(id);
    }

    public Attachment createAttachment(Attachment attachment) {
        return attachmentRepository.save(attachment);
    }

    public Optional<Attachment> updateAttachment(Long id, Attachment updatedAttachment) {
        return attachmentRepository.findById(id).map(existing -> {
            existing.setFileUrl(updatedAttachment.getFileUrl());
            existing.setUploadedAt(updatedAttachment.getUploadedAt());
            existing.setTicket(updatedAttachment.getTicket());
            return attachmentRepository.save(existing);
        });
    }

    public boolean deleteAttachment(Long id) {
        return attachmentRepository.findById(id).map(existing -> {
            attachmentRepository.delete(existing);
            return true;
        }).orElse(false);
    }

    public List<Attachment> getAttachmentsByTicket(Long ticketId) {
        return attachmentRepository.findByTicket_TicketId(ticketId);
    }
}
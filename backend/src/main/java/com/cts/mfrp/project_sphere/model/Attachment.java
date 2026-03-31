package com.cts.mfrp.project_sphere.model;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "attachmentId")
@Entity
public class Attachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "attachment_id")
    private Long attachmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id")
    private Ticket ticket;

    @Column(name = "file_url", length = 500, nullable = false)
    private String fileUrl;

    @CreationTimestamp
    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private LocalDateTime uploadedAt;

    public Attachment() {}

    public Attachment(Long attachmentId, Ticket ticket, String fileUrl, LocalDateTime uploadedAt) {
        this.attachmentId = attachmentId;
        this.ticket = ticket;
        this.fileUrl = fileUrl;
        this.uploadedAt = uploadedAt;
    }

    public Attachment(Ticket ticket, String fileUrl, LocalDateTime uploadedAt) {
        this.ticket = ticket;
        this.fileUrl = fileUrl;
        this.uploadedAt = uploadedAt;
    }

    public Long getAttachmentId() {
        return attachmentId;
    }

    public void setAttachmentId(Long attachmentId) {
        this.attachmentId = attachmentId;
    }

    public Ticket getTicket() {
        return ticket;
    }

    public void setTicket(Ticket ticket) {
        this.ticket = ticket;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    @Override
    public String toString() {
        return "Attachment{" +
                "attachmentId=" + attachmentId +
                ", ticket=" + ticket +
                ", fileUrl='" + fileUrl + '\'' +
                ", uploadedAt=" + uploadedAt +
                '}';
    }
}
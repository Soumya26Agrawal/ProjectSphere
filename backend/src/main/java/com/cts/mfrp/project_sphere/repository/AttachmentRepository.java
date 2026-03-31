package com.cts.mfrp.project_sphere.repository;

import com.cts.mfrp.project_sphere.model.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    List<Attachment> findByTicket_TicketId(Long ticketId);
}
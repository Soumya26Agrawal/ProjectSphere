package com.cts.mfrp.project_sphere.repository;

import com.cts.mfrp.project_sphere.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TicketRepository extends JpaRepository<Ticket,Long> {
}

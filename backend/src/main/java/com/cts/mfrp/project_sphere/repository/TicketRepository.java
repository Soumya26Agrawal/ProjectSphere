package com.cts.mfrp.project_sphere.repository;

import com.cts.mfrp.project_sphere.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket,Long> {
    @Query("SELECT t.ticketId FROM Ticket t WHERE t.type = 'DEFECT' and t.defect IS null")
    List<Long> findUnMappedTickets();
    @Query("SELECT t FROM Ticket t WHERE t.sprint IS null")
    List<Ticket> getBacklog();
}

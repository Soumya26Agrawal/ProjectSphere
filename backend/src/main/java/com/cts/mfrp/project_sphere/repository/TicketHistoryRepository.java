package com.cts.mfrp.project_sphere.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.cts.mfrp.project_sphere.model.TicketHistory;
import java.util.List;

@Repository
public interface TicketHistoryRepository extends JpaRepository<TicketHistory, Long> {
    
    @Query("SELECT th FROM TicketHistory th WHERE th.ticket.ticketId = :ticketId ORDER BY th.timeStamp DESC")
    List<TicketHistory> findByTicketTicketIdOrderByTimeStampDesc(@Param("ticketId") long ticketId);

    /**
     * Status-change history for every ticket currently parked in a sprint, oldest first.
     * Used by the sprint burndown endpoint to walk completion timestamps day-by-day.
     */
    @Query("SELECT th FROM TicketHistory th " +
           "WHERE th.ticket.sprint.sprintId = :sprintId " +
           "  AND th.fieldChanged = 'status' " +
           "ORDER BY th.timeStamp ASC")
    List<TicketHistory> findStatusHistoryForSprint(@Param("sprintId") Long sprintId);
}

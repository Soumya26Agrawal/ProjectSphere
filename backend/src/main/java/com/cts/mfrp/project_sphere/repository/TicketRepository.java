package com.cts.mfrp.project_sphere.repository;

import com.cts.mfrp.project_sphere.dto.DefectSummaryDTO;
import com.cts.mfrp.project_sphere.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket,Long> {
    @Query("SELECT t.ticketId FROM Ticket t WHERE t.type = 'DEFECT' and t.defect IS null")
    public List<Long> findUnMappedTickets();
    @Query("SELECT t FROM Ticket t WHERE t.sprint IS null")
    public List<Ticket> getBacklog();

    @Query("select new com.cts.mfrp.project_sphere.dto.DefectSummaryDTO(t.status,count(t.ticketId)) from Ticket t where t.type = 'DEFECT' group by t.status")
    public List<DefectSummaryDTO> getDefectSummary();

    @Query("select t from Ticket t where t.sprint.sprintId in :ids and t.type=com.cts.mfrp.project_sphere.Enum.TicketType.DEFECT")
    List<Ticket> findDefectsInActiveSprints(@Param("ids") List<Long> activeSprintIds);

    /** All tickets for a project, regardless of sprint (includes epics and backlog). */
    List<Ticket> findByProjectProjectId(Long projectId);
}

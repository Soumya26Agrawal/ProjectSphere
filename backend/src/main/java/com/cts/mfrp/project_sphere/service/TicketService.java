package com.cts.mfrp.project_sphere.service;

import com.cts.mfrp.project_sphere.Enum.Status;
import com.cts.mfrp.project_sphere.dto.DefectSummaryDTO;
import com.cts.mfrp.project_sphere.dto.TicketRequestDTO;
import com.cts.mfrp.project_sphere.model.Project;
import com.cts.mfrp.project_sphere.model.Sprint;
import com.cts.mfrp.project_sphere.model.Ticket;
import com.cts.mfrp.project_sphere.model.TicketHistory;
import com.cts.mfrp.project_sphere.model.User;
import com.cts.mfrp.project_sphere.repository.ProjectRepository;
import com.cts.mfrp.project_sphere.repository.SprintRepository;
import com.cts.mfrp.project_sphere.repository.TicketHistoryRepository;
import com.cts.mfrp.project_sphere.repository.TicketRepository;
import com.cts.mfrp.project_sphere.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.beans.Transient;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketService {
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final SprintRepository sprintRepository;
    private final TicketHistoryRepository ticketHistoryRepository;

    @Transactional
    public Ticket createTicket(TicketRequestDTO ticket) {
        Project project = projectRepository.getReferenceById(ticket.getProject());

        // EPICs (and backlog items) live outside any sprint, so accept null.
        Sprint sprint = ticket.getSprint() != null
                ? sprintRepository.getReferenceById(ticket.getSprint())
                : null;

        // Assignee is optional — explicitly "Unassigned" is fine for any type.
        User assignee = ticket.getAssignee() != null
                ? userRepository.getReferenceById(ticket.getAssignee())
                : null;

        // Parent is optional. Used for: SUB_TASK → parent USER_STORY, or
        // USER_STORY / TASK / DEFECT → parent EPIC. EPICs themselves have no parent.
        Ticket parent = ticket.getParent() != null
                ? ticketRepository.getReferenceById(ticket.getParent())
                : null;

        // Reporter = the authenticated user. Fall back to assignee so the
        // FK still has a value if the request slipped through anonymously.
        User reporter = currentAuthenticatedUserOr(assignee);

        Ticket newTicket = Ticket.builder()
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .storyPoints(ticket.getStoryPoints())
                .project(project)
                .sprint(sprint)
                .assignee(assignee)
                .reporter(reporter)
                .parent(parent)
                .status(ticket.getStatus())
                .type(ticket.getType())
                .build();

        return ticketRepository.save(newTicket);
    }

    private User currentAuthenticatedUserOr(User fallback) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User u) {
            return u;
        }
        return fallback;
    }

    public List<Long> getUnMappedTickets() {
        return ticketRepository.findUnMappedTickets();
    }

    public List<Ticket> getBacklog() {
        return ticketRepository.getBacklog();
    }

    public List<DefectSummaryDTO> getDefectSummary() {
        return ticketRepository.getDefectSummary();
    }

    public List<Ticket> getDefectsInActiveSprints(List<Long> activeSprintIds) {
        return ticketRepository.findDefectsInActiveSprints(activeSprintIds);
    }

    /** All tickets for a project, in any state — used by the analytics page to count
     *  epics and backlog items that aren't bound to a sprint. */
    public List<Ticket> getTicketsByProject(Long projectId) {
        return ticketRepository.findByProjectProjectId(projectId);
    }

    /**
     * Apply a partial update to a ticket and write one TicketHistory row per
     * changed field. Title/description/type/storyPoints follow PATCH semantics
     * (null = leave alone). Sprint/assignee/parent are PUT-style — null clears
     * the relationship — because the edit form always sends the user's
     * intended value for those.
     */
    @Transactional
    public Ticket updateTicket(Long ticketId, com.cts.mfrp.project_sphere.dto.TicketUpdateRequestDTO req) {
        Ticket t = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + ticketId));
        Long changedBy = currentUserIdOrFallback(t);

        if (req.getTitle() != null && !java.util.Objects.equals(t.getTitle(), req.getTitle())) {
            history(t, "title", t.getTitle(), req.getTitle(), changedBy);
            t.setTitle(req.getTitle());
        }
        if (req.getDescription() != null && !java.util.Objects.equals(t.getDescription(), req.getDescription())) {
            history(t, "description", t.getDescription(), req.getDescription(), changedBy);
            t.setDescription(req.getDescription());
        }
        if (req.getStatus() != null && t.getStatus() != req.getStatus()) {
            history(t, "status",
                    t.getStatus() == null ? "" : t.getStatus().name(),
                    req.getStatus().name(), changedBy);
            t.setStatus(req.getStatus());
        }
        if (req.getType() != null && t.getType() != req.getType()) {
            history(t, "type",
                    t.getType() == null ? "" : t.getType().name(),
                    req.getType().name(), changedBy);
            t.setType(req.getType());
        }
        if (req.getStoryPoints() != null && !java.util.Objects.equals(t.getStoryPoints(), req.getStoryPoints())) {
            history(t, "storyPoints",
                    String.valueOf(t.getStoryPoints()),
                    String.valueOf(req.getStoryPoints()), changedBy);
            t.setStoryPoints(req.getStoryPoints());
        }

        // Sprint — PUT-style: null clears.
        Long oldSprintId = t.getSprint() == null ? null : t.getSprint().getSprintId();
        if (!java.util.Objects.equals(oldSprintId, req.getSprint())) {
            history(t, "sprint", String.valueOf(oldSprintId), String.valueOf(req.getSprint()), changedBy);
            t.setSprint(req.getSprint() == null ? null : sprintRepository.getReferenceById(req.getSprint()));
        }

        // Assignee — PUT-style.
        Long oldAssigneeId = t.getAssignee() == null ? null : t.getAssignee().getUserId();
        if (!java.util.Objects.equals(oldAssigneeId, req.getAssignee())) {
            history(t, "assignee", String.valueOf(oldAssigneeId), String.valueOf(req.getAssignee()), changedBy);
            t.setAssignee(req.getAssignee() == null ? null : userRepository.getReferenceById(req.getAssignee()));
        }

        // Parent — PUT-style. A ticket cannot be its own parent.
        Long oldParentId = t.getParent() == null ? null : t.getParent().getTicketId();
        if (!java.util.Objects.equals(oldParentId, req.getParent())) {
            if (req.getParent() != null && req.getParent().equals(ticketId)) {
                throw new IllegalArgumentException("A ticket cannot be its own parent");
            }
            history(t, "parent", String.valueOf(oldParentId), String.valueOf(req.getParent()), changedBy);
            t.setParent(req.getParent() == null ? null : ticketRepository.getReferenceById(req.getParent()));
        }

        return ticketRepository.save(t);
    }

    private void history(Ticket t, String field, String oldVal, String newVal, Long changedBy) {
        ticketHistoryRepository.save(
                TicketHistory.builder()
                        .ticket(t)
                        .changedBy(changedBy)
                        .fieldChanged(field)
                        .oldValue(oldVal == null ? "" : oldVal)
                        .newValue(newVal == null ? "" : newVal)
                        .build());
    }

    /**
     * Update a ticket's status and write a TicketHistory row capturing the
     * before/after values. Used by the kanban board's drag-and-drop.
     */
    @Transactional
    public Ticket updateStatus(Long ticketId, Status newStatus) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + ticketId));

        Status oldStatus = ticket.getStatus();
        if (oldStatus == newStatus) {
            return ticket;
        }

        ticket.setStatus(newStatus);
        Ticket saved = ticketRepository.save(ticket);

        Long changedBy = currentUserIdOrFallback(ticket);
        TicketHistory history = TicketHistory.builder()
                .ticket(saved)
                .changedBy(changedBy)
                .fieldChanged("status")
                .oldValue(oldStatus == null ? "" : oldStatus.name())
                .newValue(newStatus.name())
                .build();
        ticketHistoryRepository.save(history);

        return saved;
    }

    private Long currentUserIdOrFallback(Ticket ticket) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User u) {
            return u.getUserId();
        }
        // No authenticated principal — attribute the change to the assignee so
        // the history row at least references a real user.
        if (ticket.getAssignee() != null) return ticket.getAssignee().getUserId();
        if (ticket.getReporter() != null) return ticket.getReporter().getUserId();
        return 0L;
    }
}

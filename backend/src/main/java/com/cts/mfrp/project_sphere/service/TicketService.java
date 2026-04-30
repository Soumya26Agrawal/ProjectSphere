package com.cts.mfrp.project_sphere.service;

import com.cts.mfrp.project_sphere.dto.*;

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

    public List<Long> findUserStories(){
        return ticketRepository.findUserStories();
    }

    public List<Ticket> getActiveUserStories(){
        return ticketRepository.getActiveUserStories();
    }

    public Ticket getUserStoryById(Long userStoryId){
        return ticketRepository.findById(userStoryId).orElseThrow();
    }
}

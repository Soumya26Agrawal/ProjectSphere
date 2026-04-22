package com.cts.mfrp.project_sphere.service;

import com.cts.mfrp.project_sphere.dto.DefectSummaryDTO;
import com.cts.mfrp.project_sphere.dto.TicketRequestDTO;
import com.cts.mfrp.project_sphere.model.Project;
import com.cts.mfrp.project_sphere.model.Sprint;
import com.cts.mfrp.project_sphere.model.Ticket;
import com.cts.mfrp.project_sphere.model.User;
import com.cts.mfrp.project_sphere.repository.ProjectRepository;
import com.cts.mfrp.project_sphere.repository.SprintRepository;
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

    @Transactional
    public Ticket createTicket(TicketRequestDTO ticket) {
//        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

//             User currentUser = (User) auth.getPrincipal();
//             User assignee=userRepository.getReferenceById(ticket.getAssignee());
             Project project=projectRepository.getReferenceById(ticket.getProject());
        Sprint sprint=sprintRepository.getReferenceById(ticket.getSprint());
                 Ticket newTicket = Ticket.builder()
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                         .storyPoints(ticket.getStoryPoints())
                .project(project)    // Hibernate uses the Proxy ID for the FK
//                .assignee(assignee)  // Hibernate uses the Proxy ID for the FK
//                .reporter(currentUser)
                         .sprint(sprint)
                .status(ticket.getStatus())
                .type(ticket.getType())
                .build();

        return ticketRepository.save(newTicket);

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
}

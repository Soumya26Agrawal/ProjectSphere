package com.cts.mfrp.project_sphere.service;

import com.cts.mfrp.project_sphere.Enum.DefectStatus;
import com.cts.mfrp.project_sphere.Enum.SprintStatus;
import com.cts.mfrp.project_sphere.Enum.Status;
import com.cts.mfrp.project_sphere.Enum.TicketType;
import com.cts.mfrp.project_sphere.dto.SprintCompletionResponseDTO;
import com.cts.mfrp.project_sphere.dto.SprintRequestDTO;
import com.cts.mfrp.project_sphere.dto.SprintResponseDTO;
import com.cts.mfrp.project_sphere.model.Project;
import com.cts.mfrp.project_sphere.model.Sprint;
import com.cts.mfrp.project_sphere.model.Ticket;
import com.cts.mfrp.project_sphere.repository.ProjectRepository;
import com.cts.mfrp.project_sphere.repository.SprintRepository;
import com.cts.mfrp.project_sphere.repository.TicketRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service

public class SprintService {

    private final SprintRepository sprintRepository;
    private final ProjectRepository projectRepository;
  private final TicketRepository ticketRepository;

    public SprintService(SprintRepository sprintRepository, ProjectRepository projectRepository,TicketRepository ticketRepository) {
        this.sprintRepository = sprintRepository;
        this.projectRepository = projectRepository;
        this.ticketRepository=ticketRepository;
    }

    public List<Sprint> findAll() {
        return sprintRepository.findAll();
    }

    public Optional<Sprint> findById(Long sprintId) {
        return sprintRepository.findById(sprintId);
    }

    public List<Sprint> findByProjectId(Long projectId) {
        return sprintRepository.findByProjectProjectId(projectId);
    }

    @Transactional
    public Sprint create(SprintRequestDTO sprint, Long projectId) {

        Sprint s=Sprint.builder().sprintName(sprint.getSprintName())
                .endDate(sprint.getEndDate())
                .startDate(sprint.getStartDate())
                .build();
        Project project=projectRepository.getReferenceById(projectId);
        s.setProject(project);
        return sprintRepository.save(s);

    }

    @Transactional
    public Optional<Sprint> update(Long sprintId, Sprint updated) {
        return sprintRepository.findById(sprintId)
                .map(existing -> {
                    existing.setSprintName(updated.getSprintName());
                    if (updated.getStatus() != null) {
                        existing.setStatus(updated.getStatus());
                    }
                    return sprintRepository.save(existing);
                });
    }

    @Transactional
    public void delete(Long sprintId) {
        sprintRepository.deleteById(sprintId);
    }

    public long count() {
        return sprintRepository.count();
    }



    public List<Long> getActiveSprints() {
        return sprintRepository.findActiveSprints(SprintStatus.ACTIVE);
    }

    public List<Sprint> getNonCompletedSprints(Long projectId) {
        return sprintRepository.findInCompleteSprints(SprintStatus.PLANNED,SprintStatus.ACTIVE,projectId);
    }

    @Transactional
    public String activateSprint(Long id) {
        Sprint sprint=sprintRepository.findById(id).orElseThrow();
        sprint.setStatus(SprintStatus.ACTIVE);
        return "Sprint is activated successfully";
    }

    public SprintCompletionResponseDTO completeSprint(Long id) {
        Sprint sprint=sprintRepository.findById(id).orElseThrow();
        Long projectId=sprint.getProject().getProjectId();
        List<Ticket> tickets=sprint.getTickets();
        List<Ticket> filtered=tickets.stream().filter((t)->{
            if(t.getType()== TicketType.DEFECT){
                return t.getDefect().getStatus()!= DefectStatus.CLOSED;
            }
            else{
                return t.getStatus()!= Status.COMPLETED;
            }
        }).toList();
        if(filtered.isEmpty()){
            sprint.setStatus(SprintStatus.COMPLETED);
            sprintRepository.save(sprint);
            return SprintCompletionResponseDTO.builder()
                    .isCompleted("PASS")
                    .completedWorkItems((long)tickets.size())
                    .openWorkItems(0L)
                    .build();
        }
        else{
            List<Sprint> sprints=getNonCompletedSprints(projectId);
            List<Sprint> filteredSprints=sprints.stream().filter((s)-> s.getSprintId()!=id).toList();
            List<SprintResponseDTO> dto=filteredSprints.stream().map((s)->{
                return SprintResponseDTO.builder().sprintId(s.getSprintId())
                        .sprintName(s.getSprintName())
                        .endDate(s.getEndDate())
                        .startDate(s.getStartDate())
                        .status(s.getStatus())
                        .build();
            }).toList();

            return SprintCompletionResponseDTO.builder()
                    .isCompleted("FAIL")
                    .completedWorkItems((long)(tickets.size()-filtered.size()))
                    .openWorkItems((long)filtered.size())
                    .dto(dto)
                    .build();
        }
    }

    public String forcedCompleteSprint(Long from, Long to) {
        Sprint sprint=sprintRepository.findById(from).orElseThrow();
        Long projectId=sprint.getProject().getProjectId();
        List<Ticket> tickets=sprint.getTickets();
        List<Ticket> filteredTickets=tickets.stream().filter((t)->{
            if(t.getType()== TicketType.DEFECT){
                return t.getDefect().getStatus()!= DefectStatus.CLOSED;
            }
            else{
                return t.getStatus()!= Status.COMPLETED;
            }
        }).toList();
        if(to==-1){
            filteredTickets.stream().forEach((t)->{
                t.setSprint(null);
                ticketRepository.save(t);
            });
        }
        else{
            Sprint sprintTo=sprintRepository.findById(to).orElseThrow();
            filteredTickets.stream().forEach((t)->{
                t.setSprint(sprintTo);
                ticketRepository.save(t);
            });
        }
        return "Sprint Completed Successfully and work items moved.";
    }
}

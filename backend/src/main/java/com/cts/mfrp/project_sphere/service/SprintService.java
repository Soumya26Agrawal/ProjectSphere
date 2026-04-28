package com.cts.mfrp.project_sphere.service;

import com.cts.mfrp.project_sphere.Enum.DefectStatus;
import com.cts.mfrp.project_sphere.Enum.SprintStatus;
import com.cts.mfrp.project_sphere.Enum.Status;
import com.cts.mfrp.project_sphere.Enum.TicketType;
import com.cts.mfrp.project_sphere.dto.SprintBurndownResponseDTO;
import com.cts.mfrp.project_sphere.dto.SprintCompletionResponseDTO;
import com.cts.mfrp.project_sphere.dto.SprintRequestDTO;
import com.cts.mfrp.project_sphere.dto.SprintResponseDTO;
import com.cts.mfrp.project_sphere.model.Project;
import com.cts.mfrp.project_sphere.model.Sprint;
import com.cts.mfrp.project_sphere.model.Ticket;
import com.cts.mfrp.project_sphere.model.TicketHistory;
import com.cts.mfrp.project_sphere.model.User;
import com.cts.mfrp.project_sphere.repository.ProjectRepository;
import com.cts.mfrp.project_sphere.repository.SprintRepository;
import com.cts.mfrp.project_sphere.repository.TicketHistoryRepository;
import com.cts.mfrp.project_sphere.repository.TicketRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service

public class SprintService {

    private final SprintRepository sprintRepository;
    private final ProjectRepository projectRepository;
    private final TicketRepository ticketRepository;
    private final TicketHistoryRepository ticketHistoryRepository;

    public SprintService(SprintRepository sprintRepository,
                         ProjectRepository projectRepository,
                         TicketRepository ticketRepository,
                         TicketHistoryRepository ticketHistoryRepository) {
        this.sprintRepository = sprintRepository;
        this.projectRepository = projectRepository;
        this.ticketRepository = ticketRepository;
        this.ticketHistoryRepository = ticketHistoryRepository;
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

    /**
     * Walk {@code TicketHistory} for the given sprint and produce a day-by-day
     * burndown — total + per-user. Falls back to attributing currently-completed
     * tickets to the sprint end date when no history rows exist.
     */
    @Transactional
    public SprintBurndownResponseDTO getSprintBurndown(Long sprintId) {
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new IllegalArgumentException("Sprint not found: " + sprintId));

        LocalDate start = sprint.getStartDate();
        LocalDate end = sprint.getEndDate();
        if (start == null) start = LocalDate.now().minusDays(13);
        if (end == null || !end.isAfter(start)) end = start.plusDays(13);

        List<LocalDate> days = new ArrayList<>();
        for (LocalDate d = start; !d.isAfter(end); d = d.plusDays(1)) days.add(d);
        int n = days.size();

        List<Ticket> tickets = sprint.getTickets() == null ? List.of() : sprint.getTickets();

        int committed = tickets.stream().mapToInt(t -> t.getStoryPoints() == null ? 0 : t.getStoryPoints()).sum();

        Map<String, Integer> perUserCommitted = new LinkedHashMap<>();
        for (Ticket t : tickets) {
            String name = userLabel(t.getAssignee());
            int pts = t.getStoryPoints() == null ? 0 : t.getStoryPoints();
            perUserCommitted.merge(name, pts, Integer::sum);
        }

        List<Double> ideal = new ArrayList<>(n);
        if (n <= 1 || committed <= 0) {
            for (int i = 0; i < n; i++) ideal.add(i == 0 ? (double) committed : 0.0);
        } else {
            double step = committed / (double) (n - 1);
            for (int i = 0; i < n; i++) ideal.add(round2(Math.max(0, committed - step * i)));
        }

        // Map ticket -> day-of-COMPLETED transition (latest such transition wins).
        List<TicketHistory> history = ticketHistoryRepository.findStatusHistoryForSprint(sprintId);
        Map<Long, LocalDate> completedOn = new HashMap<>();
        boolean usedFallback = false;
        for (TicketHistory th : history) {
            if (th.getTicket() == null) continue;
            String newVal = th.getNewValue() == null ? "" : th.getNewValue();
            String oldVal = th.getOldValue() == null ? "" : th.getOldValue();
            if (!"COMPLETED".equalsIgnoreCase(newVal)) {
                // Reopened — clear the prior completion so re-completion is required.
                if ("COMPLETED".equalsIgnoreCase(oldVal)) {
                    completedOn.remove(th.getTicket().getTicketId());
                }
                continue;
            }
            LocalDateTime ts = th.getTimeStamp();
            if (ts == null) continue;
            completedOn.put(th.getTicket().getTicketId(), ts.toLocalDate());
        }

        // Fallback for tickets that are COMPLETED today but have no history row yet:
        // attribute them to the sprint end date so the chart still drops.
        for (Ticket t : tickets) {
            if (t.getStatus() == Status.COMPLETED && !completedOn.containsKey(t.getTicketId())) {
                completedOn.put(t.getTicketId(), end);
                usedFallback = true;
            }
        }

        // Build the per-day actual series — total and per-user.
        List<Double> actual = new ArrayList<>(n);
        Map<String, List<Double>> perUserActual = new LinkedHashMap<>();
        for (String user : perUserCommitted.keySet()) {
            perUserActual.put(user, new ArrayList<>(n));
        }

        for (LocalDate d : days) {
            int totalCompletedByDay = 0;
            Map<String, Integer> userCompletedByDay = new HashMap<>();
            for (Ticket t : tickets) {
                LocalDate cd = completedOn.get(t.getTicketId());
                if (cd != null && !cd.isAfter(d)) {
                    int pts = t.getStoryPoints() == null ? 0 : t.getStoryPoints();
                    totalCompletedByDay += pts;
                    String name = userLabel(t.getAssignee());
                    userCompletedByDay.merge(name, pts, Integer::sum);
                }
            }
            actual.add(round2(Math.max(0, committed - totalCompletedByDay)));
            for (Map.Entry<String, Integer> e : perUserCommitted.entrySet()) {
                String user = e.getKey();
                int uc = userCompletedByDay.getOrDefault(user, 0);
                perUserActual.get(user).add(round2(Math.max(0, e.getValue() - uc)));
            }
        }

        return SprintBurndownResponseDTO.builder()
                .sprintId(sprint.getSprintId())
                .sprintName(sprint.getSprintName())
                .startDate(sprint.getStartDate())
                .endDate(sprint.getEndDate())
                .status(sprint.getStatus() == null ? null : sprint.getStatus().name())
                .committed(committed)
                .days(days)
                .ideal(ideal)
                .actual(actual)
                .perUserActual(perUserActual)
                .perUserCommitted(perUserCommitted)
                .usedFallback(usedFallback)
                .build();
    }

    private static String userLabel(User u) {
        if (u == null) return "Unassigned";
        String fn = u.getFirstName() == null ? "" : u.getFirstName().trim();
        String ln = u.getLastName() == null ? "" : u.getLastName().trim();
        String full = (fn + " " + ln).trim();
        if (!full.isEmpty()) return full;
        if (u.getEmail() != null && !u.getEmail().isBlank()) return u.getEmail();
        return "User " + u.getUserId();
    }

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
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

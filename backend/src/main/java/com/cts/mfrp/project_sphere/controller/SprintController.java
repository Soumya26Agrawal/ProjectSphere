package com.cts.mfrp.project_sphere.controller;

import com.cts.mfrp.project_sphere.dto.SprintBurndownResponseDTO;
import com.cts.mfrp.project_sphere.dto.SprintCompletionResponseDTO;
import com.cts.mfrp.project_sphere.dto.SprintRequestDTO;
import com.cts.mfrp.project_sphere.dto.SprintResponseDTO;
import com.cts.mfrp.project_sphere.dto.TicketResponseDTO;
import com.cts.mfrp.project_sphere.model.Sprint;
import com.cts.mfrp.project_sphere.service.SprintService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("api/v1/sprint")

public class SprintController {

    private final SprintService sprintService;

    public SprintController(SprintService sprintService) {
        this.sprintService = sprintService;
    }

    @GetMapping
    public ResponseEntity<List<Sprint>> getAllSprints() {
        List<Sprint> sprints = sprintService.findAll();
        return ResponseEntity.ok(sprints);
    }

    @GetMapping("/incomplete")
    public ResponseEntity<List<SprintResponseDTO>> getNonCompletedSprints(@RequestParam Long projectId) {
        List<SprintResponseDTO> sprints = sprintService.getNonCompletedSprints(projectId).stream().map((s)->{
            return SprintResponseDTO.builder().sprintId(s.getSprintId())
                    .sprintName(s.getSprintName())
                    .endDate(s.getEndDate())
                    .startDate(s.getStartDate())
                    .status(s.getStatus())
                    .build();
        }).toList();
        return ResponseEntity.status(HttpStatus.OK).body(sprints);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sprint> getSprintById(@PathVariable Long id) {
        return sprintService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Sprint>> getSprintsByProjectId(@PathVariable Long projectId) {
        List<Sprint> sprints = sprintService.findByProjectId(projectId);
        return ResponseEntity.ok(sprints);  // Returns empty list if no sprints
    }

    @PostMapping
    public ResponseEntity<SprintResponseDTO> createSprint(@RequestBody SprintRequestDTO sprint, @RequestParam Long projectId) {

        Sprint createdSprint = sprintService.create(sprint, projectId);
        SprintResponseDTO dto = SprintResponseDTO.builder()
                .sprintId(createdSprint.getSprintId())
                .sprintName(createdSprint.getSprintName())
                .startDate(createdSprint.getStartDate())
                .endDate(createdSprint.getEndDate())
                .status(createdSprint.getStatus())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Sprint> updateSprint(@PathVariable Long id, @RequestBody Sprint updatedSprint) {
        return sprintService.update(id, updatedSprint)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSprint(@PathVariable Long id) {
        if (sprintService.findById(id).isPresent()) {
            sprintService.delete(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/active")
    public List<Long> getActiveSprints() {
        return sprintService.getActiveSprints();
    }

    @PatchMapping("/activate/{sprintId}")
    public ResponseEntity<String> startSprint(@PathVariable("sprintId") Long id){
        return ResponseEntity.status(HttpStatus.OK).body(sprintService.activateSprint(id));
    }

    @PatchMapping("/complete/{sprintId}")
    public ResponseEntity<SprintCompletionResponseDTO> completeSprint(@PathVariable("sprintId") Long id){
        SprintCompletionResponseDTO response=sprintService.completeSprint(id);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @PatchMapping("/force-complete")
    public ResponseEntity<String> forcedCompleteSprint(@RequestParam Long from, @RequestParam Long to){
        String response=sprintService.forcedCompleteSprint(from,to);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    /**
     * Daily burndown for a sprint, walked from {@code TicketHistory}.
     * Returns ideal + actual + per-user remaining-points series.
     */
    @GetMapping("/{id}/burndown")
    public ResponseEntity<SprintBurndownResponseDTO> getSprintBurndown(@PathVariable("id") Long sprintId){
        try {
            return ResponseEntity.ok(sprintService.getSprintBurndown(sprintId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

}

//



//}
//
//{
//        "sprintName": "Q2 Feature Alpha",
//        "startDate": "2026-05-01",
//        "endDate": "2026-05-14",
//        "status": "PLANNED",
//        "projectId": 101
//        }


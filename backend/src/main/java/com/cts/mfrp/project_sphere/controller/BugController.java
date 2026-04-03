package com.cts.mfrp.project_sphere.controller;


import com.cts.mfrp.project_sphere.dto.DefectRequestDTO;
import com.cts.mfrp.project_sphere.dto.DefectResponseDTO;
import com.cts.mfrp.project_sphere.model.Defect;
import com.cts.mfrp.project_sphere.service.BugService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bug")
@RequiredArgsConstructor
public class BugController {

    private final BugService bugService;
    @PostMapping("/raiseDefect")

    public ResponseEntity<DefectResponseDTO> raiseDefect(@RequestBody DefectRequestDTO dto){
        Defect defect=bugService.raiseDefect(dto);
        DefectResponseDTO response=DefectResponseDTO.builder().defectId(defect.getDefectId())
                .reproducible(defect.getReproducible().name())
                .severity(defect.getSeverity().name())
                .expectedResult(defect.getExpectedResult())
                .actualResult(defect.getActualResult())
                .stepsToReproduce(defect.getStepsToReproduce())
//                .ticketId(defect.getTicket().getTicketId())
//                .ticketStatus(defect.getTicket().getStatus().name())
//                .ticketTitle(defect.getTicket().getTitle())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}

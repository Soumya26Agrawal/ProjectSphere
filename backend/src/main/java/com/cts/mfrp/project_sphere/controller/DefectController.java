package com.cts.mfrp.project_sphere.controller;


import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cts.mfrp.project_sphere.Enum.DefectStatus;
import com.cts.mfrp.project_sphere.dto.DefectRequestDTO;
import com.cts.mfrp.project_sphere.dto.DefectResponseDTO;
import com.cts.mfrp.project_sphere.model.Defect;
import com.cts.mfrp.project_sphere.service.DefectService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/defect")
@RequiredArgsConstructor
public class DefectController {

    private final DefectService defectService;

    @PostMapping
    public ResponseEntity<DefectResponseDTO> raiseDefect(@RequestBody DefectRequestDTO dto){
        Defect defect=defectService.raiseDefect(dto);

        String expectedResult = defect.getTestCase() != null ? defect.getTestCase().getExpectedResult() : "No expected result";
        String actualResult = defect.getTestCase() != null ? defect.getTestCase().getActualResult() : "No actual result";

        DefectResponseDTO response=DefectResponseDTO.builder()
                .defectId(defect.getDefectId())
                .reproducible(defect.getReproducible())
                .severity(defect.getSeverity())
                .expectedResult(expectedResult)
                .actualResult(actualResult)
                .stepsToReproduce(defect.getStepsToReproduce())
                .title(defect.getTicket()!=null ? defect.getTicket().getTitle() : "No title")
                        .firstName(defect.getTicket()!=null && defect.getTicket().getAssignee()!=null ? defect.getTicket().getAssignee().getFirstName() : "No first name")
                        .lastName(defect.getTicket()!=null && defect.getTicket().getAssignee()!=null ? defect.getTicket().getAssignee().getLastName() : "No last name")
                .status(defect.getStatus())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam DefectStatus status){
        defectService.updateStatus(id, status);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<DefectResponseDTO>> getAllDefects(){
        List<Defect> defects=defectService.getAllDefects();

        List<DefectResponseDTO> response = defects.stream()
                .map(defect -> {
                    String expectedResult = defect.getTestCase() != null ? defect.getTestCase().getExpectedResult() : "No expected result";
                    String actualResult = defect.getTestCase() != null ? defect.getTestCase().getActualResult() : "No actual result";
                    
                    return DefectResponseDTO.builder()
                        .defectId(defect.getDefectId())
                        .reproducible(defect.getReproducible())
                        .severity(defect.getSeverity())
                        .expectedResult(expectedResult)
                        .actualResult(actualResult)
                        .title(defect.getTicket()!=null ? defect.getTicket().getTitle() : "No title")
                        .firstName(defect.getTicket()!=null && defect.getTicket().getAssignee()!=null ? defect.getTicket().getAssignee().getFirstName() : "No first name")
                        .lastName(defect.getTicket()!=null && defect.getTicket().getAssignee()!=null ? defect.getTicket().getAssignee().getLastName() : "No last name")
                        .stepsToReproduce(defect.getStepsToReproduce())
                        .status(defect.getStatus())
                        .build();
                })
                .toList();
        
        return ResponseEntity.ok(response);

    }
}

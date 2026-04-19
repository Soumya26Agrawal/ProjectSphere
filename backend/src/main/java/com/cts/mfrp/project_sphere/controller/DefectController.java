package com.cts.mfrp.project_sphere.controller;


import com.cts.mfrp.project_sphere.dto.DefectRequestDTO;
import com.cts.mfrp.project_sphere.dto.DefectResponseDTO;
import com.cts.mfrp.project_sphere.model.Defect;
import com.cts.mfrp.project_sphere.service.DefectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/defect")
@RequiredArgsConstructor
public class DefectController {

    private final DefectService defectService;
    @PostMapping

    public ResponseEntity<DefectResponseDTO> raiseDefect(@RequestBody DefectRequestDTO dto){
        Defect defect=defectService.raiseDefect(dto);
        DefectResponseDTO response=DefectResponseDTO.builder().defectId(defect.getDefectId())
                .reproducible(defect.getReproducible())
                .severity(defect.getSeverity())
                .expectedResult(defect.getExpectedResult())
                .actualResult(defect.getActualResult())
                .stepsToReproduce(defect.getStepsToReproduce())
                .status(defect.getStatus())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }




}

package com.cts.mfrp.project_sphere.dto;

import com.cts.mfrp.project_sphere.Enum.DefectStatus;
import com.cts.mfrp.project_sphere.Enum.Reproducibility;
import com.cts.mfrp.project_sphere.Enum.Severity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DefectResponseDTO {
    private Long defectId;
    private Reproducibility reproducible;
    private Severity severity;
    private String expectedResult;
    private String actualResult;
    private String title;
    private String firstName;
    private String lastName;
    private DefectStatus status;
    private List<String> stepsToReproduce;

}
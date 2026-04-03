package com.cts.mfrp.project_sphere.dto;

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
    private String reproducible;
    private String severity;
    private String expectedResult;
    private String actualResult;
    private List<String> stepsToReproduce;

    // Flattened Ticket details
//    private Long ticketId;
//    private String ticketTitle;
//    private String ticketStatus;
}
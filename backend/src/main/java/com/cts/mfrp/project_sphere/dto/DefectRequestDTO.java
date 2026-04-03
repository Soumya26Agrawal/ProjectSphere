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
public class DefectRequestDTO {
    private Long ticketId; // To link the Defect to an existing Ticket
    private Reproducibility reproducible;
    private Severity severity;
    private String expectedResult;
    private String actualResult;
    private List<String> steps;
}

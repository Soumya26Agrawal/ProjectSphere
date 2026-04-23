package com.cts.mfrp.project_sphere.dto;


import com.cts.mfrp.project_sphere.Enum.SprintStatus;
import com.cts.mfrp.project_sphere.Enum.Status;
import lombok.*;

import java.time.LocalDate;

@Data
public class SprintRequestDTO {
    private String sprintName;
    private LocalDate startDate;
    private LocalDate endDate;
//    private Long projectId;

}





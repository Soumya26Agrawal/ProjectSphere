package com.cts.mfrp.project_sphere.dto;


import com.cts.mfrp.project_sphere.Enum.SprintStatus;
import com.cts.mfrp.project_sphere.Enum.Status;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SprintRequestDTO {
    private String sprintName;
    private LocalDate startDate;
    private LocalDate endDate;


}





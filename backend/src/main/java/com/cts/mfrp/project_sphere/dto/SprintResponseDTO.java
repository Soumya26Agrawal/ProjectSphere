package com.cts.mfrp.project_sphere.dto;
import com.cts.mfrp.project_sphere.Enum.SprintStatus;
import com.cts.mfrp.project_sphere.Enum.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SprintResponseDTO {
    private Long sprintId;
    private String sprintName;

    private LocalDate startDate;
    private LocalDate endDate;

    private SprintStatus status;


    private List<TicketResponseDTO> tickets;
}



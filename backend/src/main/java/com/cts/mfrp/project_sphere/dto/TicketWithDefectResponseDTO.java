package com.cts.mfrp.project_sphere.dto;

import com.cts.mfrp.project_sphere.Enum.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TicketWithDefectResponseDTO {
    private Long ticketId;
    private String title;
    private String description;
    private Integer storyPoints;
    private String status;
    private String type;

    private DefectResponseDTO defect;
}

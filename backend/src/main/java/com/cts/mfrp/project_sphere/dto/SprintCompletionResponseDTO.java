package com.cts.mfrp.project_sphere.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.boot.internal.Abstract;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SprintCompletionResponseDTO {
    private String isCompleted;
    private Long openWorkItems;
    private Long completedWorkItems;
    private List<SprintResponseDTO> dto;
}

package com.cts.mfrp.project_sphere.dto;

import com.cts.mfrp.project_sphere.Enum.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DefectSummaryDTO {

    private Status status;
    private Long count;

}

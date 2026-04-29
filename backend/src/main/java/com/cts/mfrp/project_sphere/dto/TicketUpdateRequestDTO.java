package com.cts.mfrp.project_sphere.dto;

import com.cts.mfrp.project_sphere.Enum.Status;
import com.cts.mfrp.project_sphere.Enum.TicketType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Body for PATCH /api/v1/ticket/{id}.
 *
 * <p>The frontend's edit form sends every editable field (its current value)
 * on each save, so the service treats a null on {@code sprint}, {@code assignee},
 * or {@code parent} as "clear" and a null on the other fields as "leave alone."</p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketUpdateRequestDTO {
    private String title;
    private String description;
    private Status status;
    private TicketType type;
    private Integer storyPoints;
    private Long sprint;
    private Long assignee;
    private Long parent;
}

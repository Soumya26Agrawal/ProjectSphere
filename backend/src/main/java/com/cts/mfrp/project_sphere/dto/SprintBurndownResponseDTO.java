package com.cts.mfrp.project_sphere.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Daily burndown data for a single sprint, walked from {@code TicketHistory}.
 *
 * <p>The {@code days} list is the sprint window inclusive of both endpoints.
 * {@code ideal} is a straight-line burndown from {@code committed} to 0.
 * {@code actual} is the remaining points at the close of each day, derived
 * from history rows where {@code fieldChanged="status"} and the ticket
 * transitioned to {@code COMPLETED}. {@code perUserActual} maps each
 * assignee's display name to their own remaining-points series so the
 * frontend can plot one line per user.</p>
 *
 * <p>If no history rows exist for a sprint's tickets, the service falls back
 * to attributing currently-completed tickets to {@code sprint.endDate} so
 * the chart still shows a meaningful drop at sprint close.</p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SprintBurndownResponseDTO {

    private Long sprintId;
    private String sprintName;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;

    /** Total story points committed to this sprint (sum across all tickets). */
    private Integer committed;

    /** Inclusive list of days from startDate to endDate. */
    private List<LocalDate> days;

    /** Linear ideal burndown — committed → 0 over the sprint window. */
    private List<Double> ideal;

    /** Remaining story points at the close of each day, walked from history. */
    private List<Double> actual;

    /** Per-user remaining-points series, keyed by display name. */
    private Map<String, List<Double>> perUserActual;

    /** Per-user committed totals (same key as {@code perUserActual}). */
    private Map<String, Integer> perUserCommitted;

    /** True when no history rows were found and the actual line is fallback-derived. */
    private Boolean usedFallback;
}

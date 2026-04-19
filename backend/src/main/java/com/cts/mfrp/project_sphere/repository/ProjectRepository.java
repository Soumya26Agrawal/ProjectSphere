package com.cts.mfrp.project_sphere.repository;

import com.cts.mfrp.project_sphere.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    @Query(value = """
            SELECT DISTINCT p.*
            FROM project p
            LEFT JOIN sprint s ON s.project_id = p.project_id
            LEFT JOIN project_team pt ON pt.project_id = p.project_id
            LEFT JOIN project_team_users ptu ON ptu.team_id = pt.team_id
            WHERE
                (:search IS NULL
                    OR LOWER(p.project_name) LIKE CONCAT('%', LOWER(:search), '%')
                    OR (:searchId IS NOT NULL AND p.project_id = :searchId)
                )
            AND (:statusesEmpty = true OR p.project_status IN (:statuses))
            AND (:domainsEmpty = true OR p.domain IN (:domains))
            AND (:managerIdsEmpty = true OR p.manager_id IN (:managerIds))
            AND (:teamMemberIdsEmpty = true OR ptu.user_id IN (:teamMemberIds))
            AND (
                :timelineContext IS NULL
                OR (:fromDate IS NULL AND :toDate IS NULL)
                OR (
                    :timelineContext = 'STARTED' AND (
                        (:fromDate IS NOT NULL AND :toDate IS NOT NULL AND s.start_date BETWEEN :fromDate AND :toDate)
                        OR ((:fromDate IS NULL OR :toDate IS NULL) AND s.start_date = COALESCE(:fromDate, :toDate))
                    )
                )
                OR (
                    :timelineContext = 'ENDED' AND (
                        (:fromDate IS NOT NULL AND :toDate IS NOT NULL AND s.end_date BETWEEN :fromDate AND :toDate)
                        OR ((:fromDate IS NULL OR :toDate IS NULL) AND s.end_date = COALESCE(:fromDate, :toDate))
                    )
                )
                OR (
                    :timelineContext = 'ACTIVE' AND (
                        (:fromDate IS NOT NULL AND :toDate IS NOT NULL AND s.start_date <= :toDate AND s.end_date >= :fromDate)
                        OR ((:fromDate IS NULL OR :toDate IS NULL)
                            AND s.start_date <= COALESCE(:fromDate, :toDate)
                            AND s.end_date >= COALESCE(:fromDate, :toDate))
                    )
                )
            )
            """, nativeQuery = true)
    List<Project> filterProjectsRaw(
            @Param("search") String search,
            @Param("searchId") Long searchId,
            @Param("statuses") List<String> statuses,
            @Param("statusesEmpty") boolean statusesEmpty,
            @Param("domains") List<String> domains,
            @Param("domainsEmpty") boolean domainsEmpty,
            @Param("managerIds") List<Long> managerIds,
            @Param("managerIdsEmpty") boolean managerIdsEmpty,
            @Param("teamMemberIds") List<Long> teamMemberIds,
            @Param("teamMemberIdsEmpty") boolean teamMemberIdsEmpty,
            @Param("timelineContext") String timelineContext,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate
    );
}
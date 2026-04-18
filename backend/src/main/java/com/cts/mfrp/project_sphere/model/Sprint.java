package com.cts.mfrp.project_sphere.model;

import com.cts.mfrp.project_sphere.Enum.SprintStatus;
import com.cts.mfrp.project_sphere.Enum.Status;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sprint")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "sprintId")
public class Sprint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sprint_id")
    private Long sprintId;

    @Column(name = "sprint_name", length = 255, nullable = false)
    private String sprintName;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private SprintStatus status=SprintStatus.PLANNED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
//    @JsonIgnore
    private Project project;

    @OneToMany(mappedBy = "sprint",fetch=FetchType.LAZY, orphanRemoval = true)
    @Builder.Default
    private List<Ticket> tickets=new ArrayList<>();
}


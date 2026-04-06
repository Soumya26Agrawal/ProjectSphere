package com.cts.mfrp.project_sphere.model;

import com.cts.mfrp.project_sphere.Enum.Domain;
import com.cts.mfrp.project_sphere.Enum.ProjectStatus;
import com.cts.mfrp.project_sphere.Enum.Status;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "project")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "projectId")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "project_id")
    private Long projectId;

    @Column(name = "project_name", length = 255, nullable = false)
    private String projectName;

    @Column(name = "product_description", length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "project_status", nullable = false)
//    @Builder.Default
    private ProjectStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "domain", nullable = false)
//    @Builder.Default
    private Domain domain;

    @OneToMany(mappedBy = "project",cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Ticket> tickets=new ArrayList<>();
    @OneToMany(mappedBy = "project")
    @Builder.Default
    private List<Sprint> sprints = new ArrayList<>();

    @ManyToOne(fetch=FetchType.EAGER)
    @JoinColumn(name="manager_id")
    private User manager;
}


package com.cts.mfrp.project_sphere.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "project_team")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectTeam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "team_id")
    private Long teamId;

    // Nullable at the DB layer so `ddl-auto=update` can ADD the column on an
    // existing project_team table. Required-ness is enforced by the service.
    @Column(name = "team_name", length = 255)
    private String teamName;

    @OneToOne
    @JoinColumn(name = "project_id", nullable = false, unique = true)
    private Project project;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "scrum_master_id")
    private User scrumMaster;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "project_team_users",
            joinColumns = @JoinColumn(name = "team_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @Builder.Default
    private List<User> users = new ArrayList<>();
}

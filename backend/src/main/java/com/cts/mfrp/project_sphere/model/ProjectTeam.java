package com.cts.mfrp.project_sphere.model;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "teamId", scope = ProjectTeam.class)
import jakarta.persistence.*;
import java.util.List;
@Entity
@Table(name = "project_team")
public class ProjectTeam {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long teamId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(nullable = false)
    private User user;

    @Column(nullable = false, length = 50)
    private String projectRole; // e.g., Scrum Master, Developer

    @Override
    public String toString() {
        return "ProjectTeam{" +
                "teamId=" + teamId +
                ", projectId='" + project.getProjectId() + '\'' +
                ", employeeId='" + user.getUserId() + '\'' +
                ", projectRole='" + projectRole + '\'' +
                '}';
    }
    @Column(name = "team_id")
    private Long teamId;  
    // ONE-TO-ONE WITH PROJECT (renamed variable)
    @OneToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project projectId;   
    // MANY-TO-MANY WITH USERS
    @ManyToMany
    @JoinTable(
        name = "project_team_users",
        joinColumns = @JoinColumn(name = "team_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> users;
    // Constructors
    public ProjectTeam() {}
    public ProjectTeam(Project projectId, List<User> users) {
        this.projectId = projectId;
        this.users = users;
    }
    // Getters & Setters
    public Long getTeamId() {
        return teamId;
    }
    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }
    public Project getProjectId() {
        return projectId;
    }
    public void setProjectId(Project projectId) {
        this.projectId = projectId;
    }
    public List<User> getUsers() {
        return users;
    }
    public void setUsers(List<User> users) {
        this.users = users;
    }

}
 
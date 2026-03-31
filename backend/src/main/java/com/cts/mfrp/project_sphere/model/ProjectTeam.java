package com.cts.mfrp.project_sphere.model;
import jakarta.persistence.*;
import java.util.List;
@Entity
@Table(name = "project_team")
public class ProjectTeam {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "team_id")
    private Long teamId;  
    @OneToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project projectId;   
    @ManyToMany
    @JoinTable(
        name = "project_team_users",
        joinColumns = @JoinColumn(name = "team_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> users;
    public ProjectTeam() {}
    public ProjectTeam(Project projectId, List<User> users) {
        this.projectId = projectId;
        this.users = users;
    }
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
 
package com.cts.mfrp.project_sphere.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "project_team")
public class ProjectTeam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "team_id")
    private Integer teamId;

    @Column(name = "project_id", nullable = false, length = 50)
    private String projectId;

    @Column(name = "employee_id", nullable = false, length = 50)
    private String employeeId;

    @Column(name = "project_role", nullable = false, length = 50)
    private String projectRole;

    public ProjectTeam() {
    }

    public ProjectTeam(String projectId, String employeeId, String projectRole) {
        this.projectId = projectId;
        this.employeeId = employeeId;
        this.projectRole = projectRole;
    }

    public Integer getTeamId() {
        return teamId;
    }

    public void setTeamId(Integer teamId) {
        this.teamId = teamId;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public String getProjectRole() {
        return projectRole;
    }

    public void setProjectRole(String projectRole) {
        this.projectRole = projectRole;
    }

    @Override
    public String toString() {
        return "ProjectTeam{" +
                "teamId=" + teamId +
                ", projectId='" + projectId + '\'' +
                ", employeeId='" + employeeId + '\'' +
                ", projectRole='" + projectRole + '\'' +
                '}';
    }
}


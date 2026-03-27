package com.cts.mfrp.project_sphere.model;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
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
    @Column(name = "project_id", length = 50)
    private String projectId;

    @Column(name = "project_name", length = 255, nullable = false)
    private String projectName;

    @Column(name = "project_manager_id", length = 50)
    private String projectManagerId;

    @OneToMany(mappedBy = "project")
    @Builder.Default
    private List<Sprint> sprints = new ArrayList<>();
}


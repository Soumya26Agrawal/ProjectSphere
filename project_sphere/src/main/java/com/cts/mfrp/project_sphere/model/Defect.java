package com.cts.mfrp.project_sphere.model;

import com.cts.mfrp.project_sphere.Enum.Reproducibility;
import com.cts.mfrp.project_sphere.Enum.Severity;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
public class Defect {
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private long id;
@OneToOne(fetch=FetchType.EAGER,cascade = CascadeType.ALL)
@JoinColumn(name="ticket_id")
private Ticket ticket;
private Reproducibility reproducible;
private String expectedResult;
private String actualResult;
@ElementCollection
@CollectionTable(name = "defect_reproduce_steps", joinColumns = @JoinColumn(name = "id"))
@Column(name = "steps") // The name of the column in the 'ticket_tags' table
private List<String> stepsToReproduce=new ArrayList<>();
private Severity severity;


}

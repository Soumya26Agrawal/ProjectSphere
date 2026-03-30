package com.cts.mfrp.project_sphere.model;
import com.cts.mfrp.project_sphere.Enum.Reproducibility;
import com.cts.mfrp.project_sphere.Enum.Severity;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;

@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "defectId")
@Entity
@Data
@NoArgsConstructor
public class Defect {
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private long defectId;
@OneToOne(fetch=FetchType.EAGER,cascade = CascadeType.ALL)
@JoinColumn(name="ticket_id")
private Ticket ticket;
@Enumerated(EnumType.STRING)
private Reproducibility reproducible;
@Enumerated(EnumType.STRING)
private Severity severity;
private String expectedResult;
private String actualResult;
@ElementCollection
@CollectionTable(name = "defect_reproduce_steps", joinColumns = @JoinColumn(name = "defect_id"))
@Column(name = "steps")
private List<String> stepsToReproduce=new ArrayList<>();



}

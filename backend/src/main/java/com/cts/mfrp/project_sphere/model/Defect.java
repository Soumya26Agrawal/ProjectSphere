package com.cts.mfrp.project_sphere.model;
import com.cts.mfrp.project_sphere.Enum.DefectStatus;
import com.cts.mfrp.project_sphere.Enum.Reproducibility;
import com.cts.mfrp.project_sphere.Enum.Severity;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;

@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "defectId", scope = Defect.class)
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Defect {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long defectId;

    @OneToOne(fetch=FetchType.EAGER,cascade = {CascadeType.MERGE,CascadeType.REMOVE})
    @JoinColumn(name="ticket_id")
    private Ticket ticket;
    
    @Enumerated(EnumType.STRING)
    private Reproducibility reproducible;
    
    @Enumerated(EnumType.STRING)
    private Severity severity;
    
    private String expectedResult;
    private String actualResult;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private DefectStatus status = DefectStatus.NEW;
    
    @ElementCollection
    @CollectionTable(joinColumns = @JoinColumn(name="defect_id"))
    private List<String> stepsToReproduce=new ArrayList<>();  // by default Element Collection uses Lazy loaded
}

package com.cts.mfrp.project_sphere.model;

import com.cts.mfrp.project_sphere.Enum.Complexity;
import com.cts.mfrp.project_sphere.Enum.TestCaseType;
import com.cts.mfrp.project_sphere.Enum.TestStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestCase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long testCaseId;
    private String description;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "designer_id")
    private User designer;
    @Enumerated(EnumType.STRING)
    private TestCaseType type;
    private String testData;
    @Enumerated(EnumType.STRING)
    private Complexity complexity;
//    @ElementCollection
//    @CollectionTable(name = "test_case_steps", joinColumns = @JoinColumn(name = "test_case_id"))// The name of the string column in the new table
//    private List<String> steps;
    private String expectedResult;
    private String actualResult;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    private TestStatus status=TestStatus.NEW;

    @ManyToMany
    @JoinTable(
            name = "textcase_userstory", // Name of the join table
            joinColumns = @JoinColumn(name = "test_case_id"), // FK for this entity
            inverseJoinColumns = @JoinColumn(name = "ticket_id") // FK for the other entity
    )

    private List<Ticket> userStories;

    @OneToOne(mappedBy="testCase", cascade = CascadeType.REMOVE)
    private Defect defect;
}

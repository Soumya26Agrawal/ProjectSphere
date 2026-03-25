package com.cts.mfrp.project_sphere.model;

import com.cts.mfrp.project_sphere.Enum.Role;
import com.cts.mfrp.project_sphere.Enum.Status;
import com.cts.mfrp.project_sphere.Enum.TicketType;
import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long ticket_id;
    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;                  // add one to many in sprint
    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name = "sprint_id")
    private Sprint sprint;                    // add one to many in sprint
    @ManyToOne(fetch=FetchType.EAGER)
    @JoinColumn(name="parent_id")
    private Ticket parent;
    @OneToMany(fetch=FetchType.LAZY)
    private List<Ticket> children=new ArrayList<>();
    @ManyToOne(fetch=FetchType.EAGER)
    @JoinColumn(name="assignee_id")
    private User assignee;
    @ManyToOne(fetch=FetchType.EAGER)
    @JoinColumn(name="reporter_id")
    private User reporter;
    @Enumerated(EnumType.STRING)
    private TicketType type;
    @Enumerated(EnumType.STRING)
    @OneToOne(fetch=FetchType.EAGER,cascade = CascadeType.ALL)
    private Defect defect;
    private Status status;
    private int storyPoints;
    private String title;
    private String description;
    private OffsetDateTime createdAt;
    private OffsetDateTime resolvedAt;

}

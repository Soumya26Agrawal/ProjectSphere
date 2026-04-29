package com.cts.mfrp.project_sphere.model;

import com.cts.mfrp.project_sphere.Enum.Status;
import com.cts.mfrp.project_sphere.Enum.TicketType;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@Builder
@AllArgsConstructor
//@EntityListeners(AuditingEntityListener.class)
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "ticketId", scope = Ticket.class)
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long ticketId;
    
    @JsonIgnore
    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="project_id")
    private Project project;                  // add one to many in sprint

    @JsonIgnore
    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="sprint_id")
    private Sprint sprint;                    // add one to many in sprint

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="parent_id")
    private Ticket parent;

    @JsonIgnore
    @Builder.Default
    @OneToMany(mappedBy = "parent", fetch=FetchType.LAZY,orphanRemoval = true,cascade = CascadeType.REMOVE)
    private List<Ticket> children=new ArrayList<>();

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="assignee_id")
    private User assignee;

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="reporter_id")
    private User reporter;

    @JsonIgnore
    @Builder.Default
    @OneToMany(mappedBy = "ticket", fetch=FetchType.LAZY, cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<TicketHistory> ticketLogs=new ArrayList<>();

    @JsonIgnore
    @Builder.Default
    @OneToMany(mappedBy = "ticket", fetch=FetchType.LAZY, cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<Comment> ticketComments=new ArrayList<>();

    @JsonIgnore
    @Builder.Default
    @OneToMany(mappedBy = "ticket", fetch=FetchType.LAZY, cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<Attachment> attachments=new ArrayList<>();
    
    @Enumerated(EnumType.STRING)
    private TicketType type;
    @OneToOne(mappedBy = "ticket", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    private Defect defect;

    @Enumerated(EnumType.STRING)
    private Status status;
    private Integer storyPoints;
    private String title;
    private String description;

    @ManyToMany(mappedBy = "userStories") // Matches the variable name in Student class
    private List<TestCase> testCases;

//    @CreatedDate
//    private OffsetDateTime createdAt;
//
//    @LastModifiedDate
//    private OffsetDateTime resolvedAt;

}

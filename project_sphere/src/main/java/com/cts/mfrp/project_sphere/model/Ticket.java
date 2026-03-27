package com.cts.mfrp.project_sphere.model;

import com.cts.mfrp.project_sphere.Enum.Status;
import com.cts.mfrp.project_sphere.Enum.TicketType;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
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
@EntityListeners(AuditingEntityListener.class)
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "ticketId")
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long ticketId;
//    @ManyToOne(fetch=FetchType.LAZY)
//    @JoinColumn(name = "project_id")
//    private Project project;                  // add one to many in sprint
//    @ManyToOne(fetch=FetchType.LAZY)
//    @JoinColumn(name = "sprint_id")
//    private Sprint sprint;                    // add one to many in sprint
    @ManyToOne(fetch=FetchType.EAGER)
    @JoinColumn(name="parent_id")
    private Ticket parent;
    @OneToMany(fetch=FetchType.LAZY,orphanRemoval = true,cascade = CascadeType.REMOVE)
    private List<Ticket> children=new ArrayList<>();
//    @ManyToOne(fetch=FetchType.EAGER)
//    @JoinColumn(name="assignee_id")
//    private User assignee;
//    @ManyToOne(fetch=FetchType.EAGER)
//    @JoinColumn(name="reporter_id")
//    private User reporter;
//    @OneToMany(fetch=FetchType.LAZY, cascade = CascadeType.REMOVE, orphanRemoval = true)
//    private List<TicketHistory> ticketLogs=new ArrayList<>();
    @OneToMany(fetch=FetchType.LAZY, cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<TicketComment> ticketComments=new ArrayList<>();
    @OneToMany(fetch=FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Attachment> attachments=new ArrayList<>();
    @Enumerated(EnumType.STRING)
    private TicketType type;
    @OneToOne(fetch=FetchType.EAGER,cascade = CascadeType.ALL)
    private Defect defect;
    @Enumerated(EnumType.STRING)
    private Status status;
    private int storyPoints;
    private String title;
    private String description;

    @CreatedDate
    private OffsetDateTime createdAt;

    @LastModifiedDate
    private OffsetDateTime resolvedAt;

}

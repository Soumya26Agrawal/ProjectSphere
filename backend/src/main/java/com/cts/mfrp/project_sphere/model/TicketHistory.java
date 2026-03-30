package com.cts.mfrp.project_sphere.model;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "historyId", scope = TicketHistory.class)
public class TicketHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long historyId;

    @ManyToOne(fetch = FetchType.LAZY)  //one ticket can have many ticket histories
    @JoinColumn(nullable = false)
    private Ticket ticket;

    @Column(nullable = false)
    private Long changedBy;   //referencing to user_id

    @Column(nullable = false)
    private String fieldChanged;  //status, assigne, any ticket field 

    @Column(nullable = false)
    private String oldValue;

    @Column(nullable = false)
    private String newValue;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime timeStamp;

}

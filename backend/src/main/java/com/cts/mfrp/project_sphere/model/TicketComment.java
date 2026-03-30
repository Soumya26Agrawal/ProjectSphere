package com.cts.mfrp.project_sphere.model;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;


@Entity
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "commentId")
public class TicketComment
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_id")
    private Integer commentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "comment_body", columnDefinition = "TEXT", nullable = false)
    private String commentBody;

    @Column(name = "created_at", nullable = false,updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    public TicketComment()
    {

    }
    public TicketComment(Integer commentId, Ticket ticket, User user, String commentBody, LocalDateTime createdAt) {
        this.commentId = commentId;
        this.ticket = ticket;
        this.user = user;
        this.commentBody = commentBody;
        this.createdAt = createdAt;
    }

    public TicketComment(Ticket ticket, User user, String commentBody, LocalDateTime createdAt) {
        this.ticket = ticket;
        this.user = user;
        this.commentBody = commentBody;
        this.createdAt = createdAt;
    }

    public Integer getCommentId() {
        return commentId;
    }

    public void setCommentId(Integer commentId) {
        this.commentId = commentId;
    }

    public Ticket getTicket() {
        return ticket;
    }

    public void setTicket(Ticket ticket) {
        this.ticket = ticket;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getCommentBody() {
        return commentBody;
    }

    public void setCommentBody(String commentBody) {
        this.commentBody = commentBody;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return "Comment{" +
                "commentId=" + commentId +
                ", ticket=" + ticket +
                ", user=" + user +
                ", commentBody='" + commentBody + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}

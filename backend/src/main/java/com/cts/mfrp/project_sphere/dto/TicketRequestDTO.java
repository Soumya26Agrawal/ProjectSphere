package com.cts.mfrp.project_sphere.dto;


import com.cts.mfrp.project_sphere.Enum.Status;
import com.cts.mfrp.project_sphere.Enum.TicketType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketRequestDTO {
    private Long project;    // ID of the Project
    private Long assignee;   // ID of the User assigned// ID of the User reporting
    private TicketType type;    // Changed from String to Enum
    private Status status=Status.TO_DO;   // Enum String (e.g., TO_DO)
    private Integer storyPoints;
    private String title;
    private String description;
}

//{
//        "project":1,
//        "assignee":4,
//        "type":"USER_STORY",
//        "status":"TO_DO",
//        "storyPoints":2,
//        "title":"Ticket creation",
//        "description":"As a user, I want to create tickets"
//
//        }
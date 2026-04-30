package com.cts.mfrp.project_sphere.controller;

import com.cts.mfrp.project_sphere.Enum.Status;
import com.cts.mfrp.project_sphere.dto.*;
import com.cts.mfrp.project_sphere.model.*;
import com.cts.mfrp.project_sphere.Enum.*;
import com.cts.mfrp.project_sphere.service.SprintService;
import com.cts.mfrp.project_sphere.service.TicketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/ticket")
@RequiredArgsConstructor
//@Tag(name="",description="")
public class TicketController {

    private final TicketService ticketService;
    private final SprintService sprintService;

//    @Operation(summary="")
    @PostMapping
    public ResponseEntity<TicketResponseDTO> createTicket(@RequestBody TicketRequestDTO ticket){
        Ticket t=ticketService.createTicket(ticket);
        TicketResponseDTO dto=TicketResponseDTO.builder()
                .ticketId(t.getTicketId())
                .title(t.getTitle())
                .type(t.getType())
                .storyPoints(t.getStoryPoints())
                .description(t.getDescription())
                .status(t.getStatus())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);

    }
    @GetMapping("/{userStoryId}")
    public ResponseEntity<TicketResponseDTO> getUserStoryById(@PathVariable Long userStoryId){
        Ticket t=ticketService.getUserStoryById(userStoryId);
        TicketResponseDTO dto=TicketResponseDTO.builder()
                .ticketId(t.getTicketId())
                .title(t.getTitle())
                .type(t.getType())
                .storyPoints(t.getStoryPoints())
                .description(t.getDescription())
                .status(t.getStatus())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);

    }

    @GetMapping("/unmapped")
    public ResponseEntity<List<Long>> getUnMappedTickets(){
        List<Long> ticketIds=ticketService.getUnMappedTickets();
        return ResponseEntity.status(HttpStatus.OK).body(ticketIds);

    }

    @GetMapping("/backlog")
    public ResponseEntity<List<TicketWithDefectResponseDTO>> getBacklog(){
        // List<Ticket> tickets=ticketService.getBacklog();
        // List<TicketWithDefectResponseDTO> list=tickets.stream().map(ticket -> {
        //     DefectResponseDTO defectDTO = null;
        //     if(ticket.getDefect() != null ) {
                // || ticket.getType()==TicketType.DEFECT
        //         defectDTO = DefectResponseDTO.builder()
        //                 .defectId(ticket.getDefect()!=null?ticket.getDefect().getDefectId():0L)
        //                 .reproducible(ticket.getDefect()!=null?ticket.getDefect().getReproducible():Reproducibility.DEMO)
        //                 .severity(ticket.getDefect()!=null?ticket.getDefect().getSeverity():Severity.DEMO)
        //                 .status(ticket.getDefect()!=null?ticket.getDefect().getStatus():DefectStatus.NEW)
        //                 .expectedResult((ticket.getDefect()!=null && ticket.getDefect().getTestCase()!=null)?ticket.getDefect().getTestCase().getExpectedResult():"No expected result specified")
        //                    .actualResult((ticket.getDefect()!=null && ticket.getDefect().getTestCase()!=null)?ticket.getDefect().getTestCase().getActualResult():"No actual result specified")
        //                 .stepsToReproduce(ticket.getDefect()!=null?ticket.getDefect().getStepsToReproduce():new ArrayList<>())
        //                 .build();
        //     }
        //     return TicketWithDefectResponseDTO.builder()
        //             .ticketId(ticket.getTicketId())
        //             .title(ticket.getTitle())
        //             .description(ticket.getDescription())
        //             .storyPoints(ticket.getStoryPoints())
        //             .status(ticket.getStatus())
        //             .type(ticket.getType())
        //             .fullName(ticket.getAssignee()!=null?(ticket.getAssignee().getFirstName()+" "+ticket.getAssignee().getLastName()):"No User Assigned")
        //             .defect(defectDTO)
        //             .build();
        // }).toList();
        // return ResponseEntity.status(HttpStatus.OK).body(list);
        List<Ticket> tickets=ticketService.getBacklog();
        List<TicketWithDefectResponseDTO> list=tickets.stream().map(ticket -> {
            DefectResponseDTO defectDTO = null;
            if(ticket.getDefect() != null ) {
                defectDTO = DefectResponseDTO.builder()
                        .defectId(ticket.getDefect().getDefectId())
                        .reproducible(ticket.getDefect().getReproducible())
                        .severity(ticket.getDefect().getSeverity())
                        .status(ticket.getDefect().getStatus())
                        .stepsToReproduce(ticket.getDefect().getStepsToReproduce())
                        .expectedResult(ticket.getDefect().getTestCase()!=null?ticket.getDefect().getTestCase().getExpectedResult():"No expected result specified")
                           .actualResult(ticket.getDefect().getTestCase()!=null?ticket.getDefect().getTestCase().getActualResult():"No actual result specified")
                        .build();
            }
            return TicketWithDefectResponseDTO.builder()
                    .ticketId(ticket.getTicketId())
                    .title(ticket.getTitle())
                    .description(ticket.getDescription())
                    .storyPoints(ticket.getStoryPoints())
                    .status(ticket.getStatus())
                    .type(ticket.getType())
                     .fullName(ticket.getAssignee()!=null?(ticket.getAssignee().getFirstName()+" "+ticket.getAssignee().getLastName()):"No User Assigned")
                    .defect(defectDTO)
                    .build();
        }).toList();
        return ResponseEntity.status(HttpStatus.OK).body(list);
    }

    @GetMapping
    public ResponseEntity<List<DefectSummaryDTO>> getDefectSummary(){
        return ResponseEntity.status(HttpStatus.OK).body(ticketService.getDefectSummary());
    }

    /** All tickets for a project regardless of sprint — used by the analytics
     *  page to count epics and backlog items. */
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Ticket>> getTicketsByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(ticketService.getTicketsByProject(projectId));
    }

    /**
     * Apply a partial update from the edit-issue dialog. Each changed field
     * triggers a TicketHistory row.
     */
    @PatchMapping("/{id}")
    public ResponseEntity<TicketResponseDTO> updateTicket(@PathVariable("id") Long ticketId,
                                                          @RequestBody TicketUpdateRequestDTO body) {
        try {
            com.cts.mfrp.project_sphere.model.Ticket t = ticketService.updateTicket(ticketId, body);
            TicketResponseDTO dto = TicketResponseDTO.builder()
                    .ticketId(t.getTicketId())
                    .title(t.getTitle())
                    .type(t.getType())
                    .storyPoints(t.getStoryPoints())
                    .description(t.getDescription())
                    .status(t.getStatus())
                    .build();
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Update a ticket's status and write a TicketHistory row.
     * Called by the board's drag-and-drop handler.
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<TicketResponseDTO> updateStatus(@PathVariable("id") Long ticketId,
                                                          @RequestParam("status") Status status) {
        try {
            Ticket t = ticketService.updateStatus(ticketId, status);
            TicketResponseDTO dto = TicketResponseDTO.builder()
                    .ticketId(t.getTicketId())
                    .title(t.getTitle())
                    .type(t.getType())
                    .storyPoints(t.getStoryPoints())
                    .description(t.getDescription())
                    .status(t.getStatus())
                    .build();
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/defects")
    public ResponseEntity<List<TicketWithDefectResponseDTO>> getDefectsInActiveSprints(){
        List<Long> activeSprintIds=sprintService.getActiveSprints();
        List<Ticket> activeTickets=ticketService.getDefectsInActiveSprints(activeSprintIds);
        List<TicketWithDefectResponseDTO> result=activeTickets.stream().map(t -> {
            DefectResponseDTO defectDTO = null;
            if(t.getDefect() != null) {
                defectDTO = DefectResponseDTO.builder()
                        .defectId(t.getDefect().getDefectId())
                        .status(t.getDefect().getStatus())
                        .reproducible(t.getDefect().getReproducible())
                        .severity(t.getDefect().getSeverity())
                        .stepsToReproduce(t.getDefect().getStepsToReproduce())
                        .build();
            }
            return TicketWithDefectResponseDTO.builder()
                    .ticketId(t.getTicketId())
                    .type(t.getType())
                    .title(t.getTitle())
                    .storyPoints(t.getStoryPoints())
                    .description(t.getDescription())
                    .status(t.getStatus())
                    .defect(defectDTO)
                    .build();
        }).toList();
        return ResponseEntity.status(HttpStatus.OK).body(result);
    }

    @GetMapping("/user-stories")
    public ResponseEntity<List<Long>> findUserStories(){
        return ResponseEntity.status(HttpStatus.OK).body(ticketService.findUserStories());
    }

    @GetMapping("/user-stories-active")
    public ResponseEntity<List<UserStoryResponseDTO>> getActiveUserStories(){
        List<Ticket> userStories=ticketService.getActiveUserStories();
         List<UserStoryResponseDTO> response=userStories.stream().map((us)->{
            return UserStoryResponseDTO.builder()
            .userStoryId(us.getTicketId())
            .userStoryTitle(us.getTitle())
            .testCases(us.getTestCases().stream().map(tCase->{
                return TestCaseResponseDTO2.builder()
                .testCaseId(tCase.getTestCaseId())
                .status(tCase.getStatus())
                .build();
            }).toList())
            .build();
        }).toList();
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

//    @GetMapping("/getTicketsBySprint")
//
//    public ResponseEntity<?> createTicket(@RequestBody){
//        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.createService());
//    }
//
//    @PostMapping("/createTicket")
//
//    public ResponseEntity<?> createTicket(@RequestBody){
//        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.createService());
//    }
//
//    @PostMapping("/createTicket")
//
//    public ResponseEntity<?> createTicket(@RequestBody){
//        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.createService());
//    }

}

//{
//        "project":3,
//        "assignee":5,
//        "type":"USER_STORY",
//        "status":"TO_DO",
//        "storyPoints":10,
//        "title":"Ticket creation",
//        "description":"As a user, I want to create tickets"
//
//        }
package com.cts.mfrp.project_sphere.controller;

import com.cts.mfrp.project_sphere.dto.*;
import com.cts.mfrp.project_sphere.model.Ticket;
import com.cts.mfrp.project_sphere.service.TicketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ticket")
@RequiredArgsConstructor
//@Tag(name="",description="")
public class TicketController {

    private final TicketService ticketService;

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

    @GetMapping("/unmappedTickets")
    public ResponseEntity<List<Long>> getUnMappedTickets(){
        List<Long> ticketIds=ticketService.getUnMappedTickets();
        return ResponseEntity.status(HttpStatus.OK).body(ticketIds);

    }

    @GetMapping("/backlog")
    public ResponseEntity<List<TicketWithDefectResponseDTO>> getBacklog(){
        List<Ticket> tickets=ticketService.getBacklog();
        List<TicketWithDefectResponseDTO> list=tickets.stream().map((ticket)-> {
            return TicketWithDefectResponseDTO.builder()
                    .ticketId(ticket.getTicketId())
                    .title(ticket.getTitle())
                    .description(ticket.getDescription())
                    .storyPoints(ticket.getStoryPoints())
                    .status(ticket.getStatus().name())
                    .type(ticket.getType().name())
                    .defect(ticket.getDefect()!=null ? DefectResponseDTO.builder()
                            .defectId(ticket.getDefect().getDefectId())
                            .reproducible(ticket.getDefect().getReproducible())
                            .severity(ticket.getDefect().getSeverity())
                            .actualResult(ticket.getDefect().getActualResult())
                            .expectedResult(ticket.getDefect().getExpectedResult())
                            .status(ticket.getDefect().getStatus())
                            .stepsToReproduce(ticket.getDefect().getStepsToReproduce())
                            .build():null
                    )
            .build();
        }).toList();
        return ResponseEntity.status(HttpStatus.OK).body(list);
    }

    @GetMapping
    public ResponseEntity<List<DefectSummaryDTO>> getDefectSummary(){
        return ResponseEntity.status(HttpStatus.OK).body(ticketService.getDefectSummary());
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
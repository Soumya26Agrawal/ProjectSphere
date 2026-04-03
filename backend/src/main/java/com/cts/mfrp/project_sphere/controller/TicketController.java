package com.cts.mfrp.project_sphere.controller;

import com.cts.mfrp.project_sphere.dto.DefectResponseDTO;
import com.cts.mfrp.project_sphere.dto.TicketRequestDTO;
import com.cts.mfrp.project_sphere.dto.TicketResponseDTO;
import com.cts.mfrp.project_sphere.dto.TicketWithDefectResponseDTO;
import com.cts.mfrp.project_sphere.model.Ticket;
import com.cts.mfrp.project_sphere.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ticket")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @PostMapping("/createTicket")
    public ResponseEntity<TicketResponseDTO> createTicket(@RequestBody TicketRequestDTO ticket){
        Ticket t=ticketService.createTicket(ticket);
        TicketResponseDTO trd=TicketResponseDTO.builder().ticketId(t.getTicketId()).build();
        return ResponseEntity.status(HttpStatus.CREATED).body(trd);

    }

    @GetMapping("/getUnmappedTickets")
    public ResponseEntity<List<Long>> getUnMappedTickets(){
        List<Long> ticketIds=ticketService.getUnMappedTickets();
        return ResponseEntity.status(HttpStatus.OK).body(ticketIds);

    }

    @GetMapping("/getBacklog")
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
                            .reproducible(ticket.getDefect().getReproducible().name())
                            .severity(ticket.getDefect().getSeverity().name())
                            .actualResult(ticket.getDefect().getActualResult())
                            .expectedResult(ticket.getDefect().getExpectedResult())
                            .stepsToReproduce(ticket.getDefect().getStepsToReproduce())
                            .build():null
                    )
            .build();
        }).toList();
        return ResponseEntity.status(HttpStatus.OK).body(list);
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

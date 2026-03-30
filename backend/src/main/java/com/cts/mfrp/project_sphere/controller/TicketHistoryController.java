package com.cts.mfrp.project_sphere.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cts.mfrp.project_sphere.model.TicketHistory;
import com.cts.mfrp.project_sphere.service.TicketHistoryService;

@RestController
@RequestMapping("/api/ticketHistory")
public class TicketHistoryController {

    @Autowired
    TicketHistoryService ticketHistoryService;

    @GetMapping("/ticket/{ticketId}")
    public ResponseEntity<List<TicketHistory>> getHistoryOfTicket(@PathVariable long ticketId){
        List<TicketHistory> history = ticketHistoryService.findTicketHistory(ticketId);
        return ResponseEntity.ok(history);
    }
    
}

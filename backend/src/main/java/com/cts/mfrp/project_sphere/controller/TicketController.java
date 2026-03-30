package com.cts.mfrp.project_sphere.controller;

import com.cts.mfrp.project_sphere.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ticket")
@RequiredArgsConstructor
public class TicketController {

//    private final TicketService ticketService;
//
    @PostMapping("/createTicket")

    public String createTicket( ){
//        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.createService());
        return "";
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

package com.cts.mfrp.project_sphere.service;

import com.cts.mfrp.project_sphere.model.Ticket;
import com.cts.mfrp.project_sphere.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TicketService {
    private final TicketRepository ticketRepository;
    public Ticket createTicket(Ticket ticket) {
        return ticketRepository.save(ticket);
    }
}

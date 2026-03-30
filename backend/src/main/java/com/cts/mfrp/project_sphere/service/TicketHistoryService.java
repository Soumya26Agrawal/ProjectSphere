package com.cts.mfrp.project_sphere.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.cts.mfrp.project_sphere.model.TicketHistory;
import com.cts.mfrp.project_sphere.repository.TicketHistoryRepository;

@Service
public class TicketHistoryService {

    @Autowired
    TicketHistoryRepository ticketHistoryRepository;

    public List<TicketHistory> findTicketHistory(long ticketId) {
        return ticketHistoryRepository.findByTicketIdOrderByTimeStampDesc(ticketId);
    }
}

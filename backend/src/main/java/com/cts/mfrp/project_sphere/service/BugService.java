package com.cts.mfrp.project_sphere.service;

import com.cts.mfrp.project_sphere.dto.DefectRequestDTO;
import com.cts.mfrp.project_sphere.model.Defect;
import com.cts.mfrp.project_sphere.model.Ticket;
import com.cts.mfrp.project_sphere.repository.BugRepository;
import com.cts.mfrp.project_sphere.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BugService {

    private final BugRepository bugRepository;
    private final TicketRepository ticketRepository;
    public Defect raiseDefect(DefectRequestDTO dto){
        Ticket ticket= ticketRepository.getReferenceById(dto.getTicketId());

        Defect defect=Defect.builder()
                .ticket(ticket)
                .reproducible(dto.getReproducible())
                .severity(dto.getSeverity())
                .actualResult(dto.getActualResult())
                .expectedResult(dto.getExpectedResult())
                .stepsToReproduce(dto.getSteps())
                .build();
        return bugRepository.save(defect);

    }
}

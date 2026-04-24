package com.cts.mfrp.project_sphere.service;

import com.cts.mfrp.project_sphere.Enum.DefectStatus;
import com.cts.mfrp.project_sphere.dto.DefectRequestDTO;
import com.cts.mfrp.project_sphere.model.Defect;
import com.cts.mfrp.project_sphere.model.TestCase;
import com.cts.mfrp.project_sphere.model.Ticket;
import com.cts.mfrp.project_sphere.repository.DefectRepository;
import com.cts.mfrp.project_sphere.repository.TestCaseRepository;
import com.cts.mfrp.project_sphere.repository.TicketRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DefectService {

    private final DefectRepository defectRepository;
    private final TicketRepository ticketRepository;
    private final TestCaseRepository testCaseRepository;

    public Defect raiseDefect(DefectRequestDTO dto){
        Ticket ticket= ticketRepository.getReferenceById(dto.getTicketId());
        TestCase testCase=testCaseRepository.getReferenceById(dto.getTestCaseId());
        Defect defect=Defect.builder()
                .ticket(ticket)
                .reproducible(dto.getReproducible())
                .severity(dto.getSeverity())
                .testCase(testCase)
                .status(dto.getStatus())
                .stepsToReproduce(dto.getSteps())
                .build();
        return defectRepository.save(defect);

    }

    @Transactional
    public void updateStatus(Long id, DefectStatus status) {
        Defect defect = defectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Defect not found"));

        // Convert String to your backend Enum
        defect.setStatus(status);



        defectRepository.save(defect);
    }

    public List<Defect> getAllDefects(){
        return defectRepository.findAll();
    }
}

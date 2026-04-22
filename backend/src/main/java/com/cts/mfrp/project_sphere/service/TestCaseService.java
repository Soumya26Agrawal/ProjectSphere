package com.cts.mfrp.project_sphere.service;


import com.cts.mfrp.project_sphere.dto.TestCaseRequestDTO;
import com.cts.mfrp.project_sphere.dto.TestCaseResponseDTO;
import com.cts.mfrp.project_sphere.dto.TicketResponseDTO;
import com.cts.mfrp.project_sphere.model.TestCase;
import com.cts.mfrp.project_sphere.model.Ticket;
import com.cts.mfrp.project_sphere.model.User;
import com.cts.mfrp.project_sphere.repository.TestCaseRepository;
import com.cts.mfrp.project_sphere.repository.TicketRepository;
import com.cts.mfrp.project_sphere.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TestCaseService {
    private final TestCaseRepository testCaseRepository;
    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;
    public TestCaseResponseDTO createTestCase(TestCaseRequestDTO dto){
        User user=userRepository.getReferenceById(dto.getDesignerId());
        List<Long> userStoryIds=dto.getUserStoryIds();
        List<Ticket> userStories= userStoryIds.stream().map((id) -> ticketRepository.getReferenceById(id)).toList();

        TestCase testCase=TestCase.builder()
                .testData(dto.getTestData())
                .type(dto.getType())
                .complexity(dto.getComplexity())
                .expectedResult(dto.getExpectedResult())
                .description(dto.getDescription())
                .designer(user)
                .userStories(userStories)
                .build();
        TestCase tCase=testCaseRepository.save(testCase);
        TestCaseResponseDTO result=TestCaseResponseDTO.builder()
                .testData(tCase.getTestData())
                .expectedResult(tCase.getExpectedResult())
                .testCaseId(testCase.getTestCaseId())
                .complexity(tCase.getComplexity())
                .type(tCase.getType())
                .designerName(tCase.getDesigner().getFirstName()+tCase.getDesigner().getLastName())
                .description(tCase.getDescription())
                .status(tCase.getStatus())
                .userStoryTitles(tCase.getUserStories().stream().map((us)->us.getTitle()).toList())
                .build();
        return result;
    }
}

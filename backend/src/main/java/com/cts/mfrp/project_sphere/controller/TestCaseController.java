package com.cts.mfrp.project_sphere.controller;
import com.cts.mfrp.project_sphere.model.TestCase;
import com.cts.mfrp.project_sphere.dto.TestCaseRequestDTO;
import com.cts.mfrp.project_sphere.dto.TestCaseResponseDTO;
import com.cts.mfrp.project_sphere.service.TestCaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/testcase")
@RequiredArgsConstructor
public class TestCaseController {

    private final TestCaseService testCaseService;

    @PostMapping
    public ResponseEntity<TestCaseResponseDTO> createTestCase(@RequestBody TestCaseRequestDTO dto){
        return ResponseEntity.status(HttpStatus.CREATED).body(testCaseService.createTestCase(dto));
    }

    
    @GetMapping("/unmapped")
    public ResponseEntity<List<Long>> getUnMappedTestCases(){
        System.out.println("Received request to get unmapped test cases");
        List<Long> testCaseIds=testCaseService.getUnMappedTestCases();
        return ResponseEntity.status(HttpStatus.OK).body(testCaseIds);

    }

    @GetMapping
    public ResponseEntity<List<TestCaseResponseDTO>> getTestCases(){
        List<TestCase> testCases=testCaseService.getTestCases();
        List<TestCaseResponseDTO> dto=testCases.stream().map(
            (tCase)->{
                return TestCaseResponseDTO.builder()
                .testData(tCase.getTestData())
                .expectedResult(tCase.getExpectedResult())
                .testCaseId(tCase.getTestCaseId())
                .complexity(tCase.getComplexity())
                .type(tCase.getType())
                .designerName(tCase.getDesigner()!=null?(tCase.getDesigner().getFirstName()+tCase.getDesigner().getLastName()):"No designer")
                .description(tCase.getDescription())
                .status(tCase.getStatus())
                .userStoryTitles(tCase.getUserStories().stream().map((us)->us.getTitle()).toList())
                .build();
            }
        ).toList();
        return ResponseEntity.status(HttpStatus.OK).body(dto);
    }

     @GetMapping("/{testCaseId}")
    public ResponseEntity<TestCaseResponseDTO> getTestCaseById(@PathVariable Long testCaseId){
        TestCase tCase=testCaseService.getTestCaseById(testCaseId);
        TestCaseResponseDTO response= TestCaseResponseDTO.builder()
                .testData(tCase.getTestData())
                .expectedResult(tCase.getExpectedResult())
                .testCaseId(tCase.getTestCaseId())
                .complexity(tCase.getComplexity())
                .type(tCase.getType())
                .designerName(tCase.getDesigner()!=null?(tCase.getDesigner().getFirstName()+tCase.getDesigner().getLastName()):"No designer")
                .description(tCase.getDescription())
                .status(tCase.getStatus())
                .userStoryTitles(tCase.getUserStories().stream().map((us)->us.getTitle()).toList())
                .build();
            
        
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }
}
// @Query("SELECT t FROM TestCase t LEFT JOIN FETCH t.userStories LEFT JOIN FETCH t.designer")
// List<TestCase> findAllWithDetails();



//{
//        "description": "Verify user can login with valid credentials",
//        "designerId": 101,
//        "type": "FUNCTIONAL",
//        "testData": "username: admin, password: password123",
//        "complexity": "MEDIUM",
//        "expectedResult": "User should be redirected to the dashboard",
//        "status": "DRAFT",
//        "userStoryIds": [501, 502]
//        }
package com.cts.mfrp.project_sphere.controller;

import com.cts.mfrp.project_sphere.dto.TestCaseRequestDTO;
import com.cts.mfrp.project_sphere.dto.TestCaseResponseDTO;
import com.cts.mfrp.project_sphere.service.TestCaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
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
}


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
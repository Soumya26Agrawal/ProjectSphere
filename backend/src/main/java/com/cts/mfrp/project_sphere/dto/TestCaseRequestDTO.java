package com.cts.mfrp.project_sphere.dto;

import com.cts.mfrp.project_sphere.Enum.Complexity;
import com.cts.mfrp.project_sphere.Enum.TestCaseType;
import com.cts.mfrp.project_sphere.Enum.TestStatus;
import lombok.Data;

import java.util.List;

@Data
public class TestCaseRequestDTO {
    private String description;
    private Long designerId; // Reference to User entity ID
    private TestCaseType type;
    private String testData;
    private Complexity complexity;
    private String expectedResult;
    private TestStatus status;
    private List<Long> userStoryIds;
}
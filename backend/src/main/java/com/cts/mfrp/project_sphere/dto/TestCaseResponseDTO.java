package com.cts.mfrp.project_sphere.dto;

import com.cts.mfrp.project_sphere.Enum.Complexity;
import com.cts.mfrp.project_sphere.Enum.TestCaseType;
import com.cts.mfrp.project_sphere.Enum.TestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestCaseResponseDTO {
    private Long testCaseId;
    private String description;
    private String designerName; // Flattened for UI display
    private TestCaseType type;
    private String testData;
    private Complexity complexity;
    private String expectedResult;
    private TestStatus status;
    private List<String> userStoryTitles=new ArrayList<>(); // Simplified view of related tickets
}

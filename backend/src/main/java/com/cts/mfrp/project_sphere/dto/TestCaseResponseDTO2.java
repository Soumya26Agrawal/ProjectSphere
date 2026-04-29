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
public class TestCaseResponseDTO2 {
    private Long testCaseId;
    private TestStatus status;
   // Simplified view of related tickets
}

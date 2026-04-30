package com.cts.mfrp.project_sphere.dto;

import lombok.*;
import java.util.*;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStoryResponseDTO {
    private Long userStoryId;
    private String userStoryTitle;
    private List<TestCaseResponseDTO2> testCases=new ArrayList<>();

    public UserStoryResponseDTO(Long userStoryId, String userStoryTitle){
        this.userStoryId=userStoryId;
        this.userStoryTitle=userStoryTitle;
    }
}

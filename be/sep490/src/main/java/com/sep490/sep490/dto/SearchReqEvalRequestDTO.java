package com.sep490.sep490.dto;

import lombok.Data;
import lombok.RequiredArgsConstructor;
@Data
@RequiredArgsConstructor
public class SearchReqEvalRequestDTO {
    private Integer classId;
    private Integer teamId;
    private Integer studentId;
    private String studentName;
    private Integer milestoneId;
    public void validateInput(){

    }

}

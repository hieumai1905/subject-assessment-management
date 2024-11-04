package com.sep490.sep490.dto.studentEvaluation.response;

import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Data
@RequiredArgsConstructor
public class StudentEvaluationResponse {
    private Integer id;
    private String title;
    private Integer weight;
    private Float evalGrade;
    private String comment;
    private Float totalLOC;
    private String status;
    private String typeEvaluator;
    private Integer sessionId;
    private Integer teamId;
    private List<StudentEvaluationResponse> criteriaList;
}

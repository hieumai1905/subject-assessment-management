package com.sep490.sep490.dto.evaluation.request;

import lombok.Data;

@Data
public class RequirementEvaluationRequest {
    private Integer requirementId;
    private Integer teamId;
    private Float grade;
    private String comment;
}

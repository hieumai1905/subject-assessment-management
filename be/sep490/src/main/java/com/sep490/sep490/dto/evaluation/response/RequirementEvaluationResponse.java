package com.sep490.sep490.dto.evaluation.response;

import com.sep490.sep490.dto.user.request.CreateUserRequest;
import lombok.Data;

@Data
public class RequirementEvaluationResponse {
    private Integer requirementId;
    private String reqTitle;
    private String submission;
    private String submitType;
    private String status;
    private Integer teamId;
    private String teamName;
    private CreateUserRequest student;
    private Float grade;
    private String comment;
}

package com.sep490.sep490.dto.evaluation.request;

import com.sep490.sep490.common.utils.ValidateUtils;
import com.sep490.sep490.dto.studentEvaluation.request.StudentEvalRequest;
import lombok.Data;

import java.util.List;

@Data
public class EvaluateStudentForGrandFinal {
    private Integer sessionId;
    private Integer teamId;
    private List<StudentEvalRequest> studentEvals;

    public void validateInput(){
        ValidateUtils.checkNullOrEmpty(sessionId, "Session id");
        ValidateUtils.checkNullOrEmpty(teamId, "Team id");
    }
}

package com.sep490.sep490.dto.evaluation.request;

import com.sep490.sep490.common.utils.ValidateUtils;
import com.sep490.sep490.dto.studentEvaluation.request.StudentEvalRequest;
import com.sep490.sep490.dto.work_evaluation.request.EvaluateRequirementRequest;
import lombok.Data;

import java.util.List;

@Data
public class EvaluateReqForGrandFinal {
    private Integer sessionId;
    private Integer teamId;
    List<EvaluateRequirementRequest> evalRequirements;
    public void validateInput(){
        ValidateUtils.checkNullOrEmpty(sessionId, "Session id");
        ValidateUtils.checkNullOrEmpty(teamId, "Team id");
    }
}

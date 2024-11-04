package com.sep490.sep490.dto.work_evaluation.response;

import com.sep490.sep490.dto.MilestoneDTO;
import com.sep490.sep490.dto.RequirementDTO;
import com.sep490.sep490.dto.evaluation.response.GradeEvaluator;
import com.sep490.sep490.dto.work_evaluation.WorkEvaluationDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Data
public class WorkEvaluationResponse extends RequirementDTO {
    private MilestoneDTO milestoneDTO;
    private WorkEvaluationDTO requirementEval;
    private WorkEvaluationDTO updateRequirementEval;
    private List<GradeEvaluator> gradeEvaluatorList;
}

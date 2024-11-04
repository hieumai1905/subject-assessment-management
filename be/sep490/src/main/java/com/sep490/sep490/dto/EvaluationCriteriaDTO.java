package com.sep490.sep490.dto;

import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.ValidateUtils;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class EvaluationCriteriaDTO {
    private Integer id;
    private String criteriaName;
    private Integer evalWeight;
    private Boolean locEvaluation;
    private String guides;
    private Boolean active;
    private Integer assignmentId;

    public void validateInput(){
        ValidateUtils.checkNullOrEmpty(criteriaName, "Evaluation Criteria name");
        criteriaName = ValidateUtils.checkLength(criteriaName, "Evaluation Criteria name", Constants.LengthCheck.MIN, Constants.LengthCheck.MAX);

        ValidateUtils.checkIntegerInRange(evalWeight, "Evaluation weight", Constants.WeightRange.MIN, Constants.WeightRange.MAX);

        guides = ValidateUtils.checkLength(guides, "Guides", 0, Constants.DefaultValueEntity.DESCRIPTION_LENGTH);
    }
}

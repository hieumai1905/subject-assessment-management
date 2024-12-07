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
        ValidateUtils.checkNullOrEmpty(criteriaName, "Tên tiêu chí");
        criteriaName = ValidateUtils.checkLength(criteriaName, "Tên tiêu chí", Constants.LengthCheck.MIN, Constants.LengthCheck.MAX);

        ValidateUtils.checkIntegerInRange(evalWeight, "Tỷ trọng", Constants.WeightRange.MIN, Constants.WeightRange.MAX);

        guides = ValidateUtils.checkLength(guides, "Hướng dẫn", 0, Constants.DefaultValueEntity.DESCRIPTION_LENGTH);
    }
}

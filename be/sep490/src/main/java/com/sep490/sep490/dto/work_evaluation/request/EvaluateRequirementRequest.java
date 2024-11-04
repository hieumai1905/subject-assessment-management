package com.sep490.sep490.dto.work_evaluation.request;

import com.sep490.sep490.common.exception.ApiInputException;
import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.ValidateUtils;
import lombok.Data;

@Data
public class EvaluateRequirementRequest {
    private Integer reqId;
    private Integer complexityId;
    private Integer qualityId;
    private Float grade;
    private String comment;
    private Boolean isUpdateEval;

    public void validateInput(){
        ValidateUtils.checkNullOrEmpty(reqId, "Requirement id");
        if(grade != null && grade < 0){
            throw new ApiInputException("Grade must be >= 0!");
        }
        if(isUpdateEval == null)
            isUpdateEval = false;
        comment = ValidateUtils.checkLength(comment, "Comment", Constants.DefaultValueEntity.MIN_LENGTH,
                Constants.DefaultValueEntity.DESCRIPTION_LENGTH);
    }
}

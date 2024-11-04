package com.sep490.sep490.dto.studentEvaluation.request;

import com.sep490.sep490.common.exception.ApiInputException;
import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.ValidateUtils;
import lombok.Data;

@Data
public class StudentEvalRequest {
    private Integer milestoneId;
    private Integer criteriaId;
    private Integer userId;
    private String email;
    private Integer teamId;
    private Float evalGrade;
    private String comment;

    public void validateInput(boolean isGrandFinalEval){
        if(!isGrandFinalEval)
            ValidateUtils.checkNullOrEmpty(milestoneId, "Milestone id");
        if((email == null || email.isBlank()) && teamId == null)
            throw new ApiInputException("Email or team id is required!");
        if(evalGrade != null && (evalGrade < 0 || evalGrade > 10))
            throw new ApiInputException("Grade must be in range 0 to 10!");
        comment = ValidateUtils.checkLength(comment, "Comment",
                Constants.DefaultValueEntity.MIN_LENGTH, Constants.DefaultValueEntity.DESCRIPTION_LENGTH);
    }
}

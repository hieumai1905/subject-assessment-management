package com.sep490.sep490.dto.assignment.request;

import com.sep490.sep490.common.exception.ApiInputException;
import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.ValidateUtils;
import com.sep490.sep490.dto.AssignmentDTO;
import lombok.*;

import java.util.Objects;

@Data
@RequiredArgsConstructor
@AllArgsConstructor
@Builder
public class AssignmentRequest {
    private  Integer id;
    private  String title;
    private  Integer expectedLoc;
    private  Integer evalWeight;
    private  Integer displayOrder;
    private String typeEvaluator;
    private  String note;
    private Boolean active;

    public void validateInput(){
        ValidateUtils.checkNullOrEmpty(title, "Assignment title");
        title = ValidateUtils.checkLength(title, "Assignment title", 1, 255);

        note = ValidateUtils.checkLength(note, "Assignment note", 0, Constants.DefaultValueEntity.DESCRIPTION_LENGTH);
        ValidateUtils.checkNullOrEmpty(expectedLoc, "Expected Loc");
        ValidateUtils.checkIntegerInRange(expectedLoc, "Assignment expected loc", 1, Integer.MAX_VALUE);

        ValidateUtils.checkNullOrEmpty(evalWeight, "Evaluation Weight");
        ValidateUtils.checkNullOrEmpty(typeEvaluator, "Type Evaluator");
        if(!Objects.equals(typeEvaluator, Constants.TypeAssignments.NORMAL)
                && !Objects.equals(typeEvaluator, Constants.TypeAssignments.FINAL)
                && !Objects.equals(typeEvaluator, Constants.TypeAssignments.GRAND_FINAL)){
            throw new ApiInputException("Type evaluator must be Normal or Final or Grand Final!");
        }
        ValidateUtils.checkIntegerInRange(evalWeight, "Evaluation Weight", 1, 100);
        ValidateUtils.checkIntegerInRange(displayOrder, "Display order", 1, Integer.MAX_VALUE);
    }
}

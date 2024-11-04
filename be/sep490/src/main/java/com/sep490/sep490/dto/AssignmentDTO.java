package com.sep490.sep490.dto;

import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.ValidateUtils;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.util.Date;
import java.util.List;

@Data
@RequiredArgsConstructor
public class AssignmentDTO {
    private  Integer id;
    private  String title;
    private  Integer expectedLoc;
    private  Integer evalWeight;
    private  String note;
    private  Integer subjectId;
    private String typeEvaluator;
    private  String subjectName;
    private Boolean active;
    private  Integer displayOrder;
    private Date updatedDate;
    private List<EvaluationCriteriaDTO> evaluationCriterias;

    public void validateInput(){
        ValidateUtils.checkNullOrEmpty(title, "Assignment title");
        title = ValidateUtils.checkLength(title, "Assignment title", 1, 255);

        note = ValidateUtils.checkLength(note, "Assignment note", 0, Constants.DefaultValueEntity.DESCRIPTION_LENGTH);

        ValidateUtils.checkIntegerInRange(expectedLoc, "Assignment expected loc", 0, Integer.MAX_VALUE);

        ValidateUtils.checkNullOrEmpty(evalWeight, "Evaluation Weight");
        ValidateUtils.checkIntegerInRange(evalWeight, "Evaluation Weight", 1, 100);
    }
}

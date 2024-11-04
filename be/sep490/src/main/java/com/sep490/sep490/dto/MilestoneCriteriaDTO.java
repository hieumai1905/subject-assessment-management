package com.sep490.sep490.dto;

import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.ValidateUtils;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.util.Date;

@Data
@RequiredArgsConstructor
public class MilestoneCriteriaDTO {
    private Integer id;
    private Integer milestoneId;
    private Integer parentCriteriaId;
    private String criteriaName;
    private Boolean locEvaluation;
    private Integer evalWeight;
    private Date updatedDate;
    private Boolean canEdit;
    private String note;

    public void validateInput(boolean isUpdate){
//        ValidateUtils.checkNullOrEmpty(milestoneId, "Milestone Id");
        ValidateUtils.checkNullOrEmpty(criteriaName, "Criteria Name");
        ValidateUtils.checkNullOrEmpty(evalWeight, "Eval Weight");
        ValidateUtils.checkIntegerInRange(evalWeight, "Eval Weight", 1, 100);
        criteriaName = ValidateUtils.checkLength(criteriaName, "Criteria Name", 1, 255);
        note = ValidateUtils.checkLength(note, "Note", 0, 750);
        locEvaluation = locEvaluation != null && locEvaluation;
    }
}

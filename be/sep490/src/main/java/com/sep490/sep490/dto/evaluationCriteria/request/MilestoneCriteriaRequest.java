package com.sep490.sep490.dto.evaluationCriteria.request;

import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.ValidateUtils;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
@AllArgsConstructor
@Builder
public class MilestoneCriteriaRequest {
    private Integer id;
    private String criteriaName;
    private Integer evalWeight;
    private String note;

    public void validateInput(){
        note = ValidateUtils.checkLength(criteriaName, "Tên tiêu chí", 0, Constants.DefaultValueEntity.DESCRIPTION_LENGTH);
        ValidateUtils.checkNullOrEmpty(evalWeight, "Tỷ trọng");
        ValidateUtils.checkIntegerInRange(evalWeight, "Tỷ trọng", 1, 100);
    }
}

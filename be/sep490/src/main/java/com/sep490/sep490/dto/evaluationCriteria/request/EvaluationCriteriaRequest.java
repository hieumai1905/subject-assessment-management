package com.sep490.sep490.dto.evaluationCriteria.request;

import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.SortAndOrderUtils;
import com.sep490.sep490.common.utils.ValidateUtils;
import com.sep490.sep490.dto.EvaluationCriteriaDTO;
import com.sep490.sep490.entity.EvaluationCriteria;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.util.List;
@Data
@RequiredArgsConstructor
public class EvaluationCriteriaRequest {
    private Integer assignmentId;
    private List<EvaluationCriteriaDTO> listEvaluationCriteria;
    public void validateInput(){
        ValidateUtils.checkNullOrEmpty(listEvaluationCriteria, "Danh sách tiêu chí");
        for (EvaluationCriteriaDTO criteriaDTO : listEvaluationCriteria){
            criteriaDTO.validateInput();
        }
    }
}


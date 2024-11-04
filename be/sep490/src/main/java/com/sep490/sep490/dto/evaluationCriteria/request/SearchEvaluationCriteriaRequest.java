package com.sep490.sep490.dto.evaluationCriteria.request;

import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.SortAndOrderUtils;
import com.sep490.sep490.dto.SearchRequestDTO;
import com.sep490.sep490.entity.EvaluationCriteria;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class SearchEvaluationCriteriaRequest extends SearchRequestDTO {
    private String criteriaName;
    private Integer assignmentId;
    private Integer minEvalWeight;
    private Integer maxEvalWeight;
    private Boolean active;
    private String sortBy;

    public void validateInput(){
        super.validateInput();

        if(criteriaName != null)
            criteriaName = criteriaName.trim().toLowerCase();

        sortBy = SortAndOrderUtils.validateSort(sortBy, Constants.DefaultValuePage.SORT_BY, EvaluationCriteria.class.getDeclaredFields());
    }
}

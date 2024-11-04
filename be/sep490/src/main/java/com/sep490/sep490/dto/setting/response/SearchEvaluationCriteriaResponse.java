package com.sep490.sep490.dto.setting.response;

import com.sep490.sep490.dto.EvaluationCriteriaDTO;
import com.sep490.sep490.dto.SearchRequestDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Data
public class SearchEvaluationCriteriaResponse extends SearchRequestDTO {
    private List<EvaluationCriteriaDTO> evaluationCriteriaDTOS;
    private Long totalElements;
    private String sortBy;
}

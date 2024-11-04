package com.sep490.sep490.mapper;

import com.sep490.sep490.dto.EvaluationCriteriaDTO;
import com.sep490.sep490.entity.EvaluationCriteria;
import com.sep490.sep490.entity.Setting;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Data
@AllArgsConstructor
@Component
public class EvaluationCriteriaMapper {
    private static final ModelMapper modelMapper = new ModelMapper();

    public EvaluationCriteria convertUpdateEvaluationCriteriaDtoToEvaluationCriteria(EvaluationCriteriaDTO request, EvaluationCriteria oldEvaluationCriteria) {
        EvaluationCriteria response = modelMapper.map(request, EvaluationCriteria.class);
        response.setId(oldEvaluationCriteria.getId());
        return response;
    }
}

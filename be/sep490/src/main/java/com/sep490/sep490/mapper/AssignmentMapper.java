package com.sep490.sep490.mapper;

import com.sep490.sep490.dto.AssignmentDTO;
import com.sep490.sep490.dto.EvaluationCriteriaDTO;
import com.sep490.sep490.entity.Assignment;
import com.sep490.sep490.entity.EvaluationCriteria;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Data
@AllArgsConstructor
@Component
public class AssignmentMapper {
    private static final ModelMapper modelMapper = new ModelMapper();
    public Assignment convertUpdateAssignmentDtoToAssignment(AssignmentDTO request,Assignment oldAssignment){
        Assignment response=modelMapper.map(request,Assignment.class);
        response.setId(oldAssignment.getId());
        return  response;
    }

    public EvaluationCriteria convertToEvaluationCriteria(EvaluationCriteriaDTO dto, Assignment assignment){
        EvaluationCriteria response = modelMapper.map(dto, EvaluationCriteria.class);
        response.setId(null);
        response.setAssignment(assignment);
        return response;
    }
}

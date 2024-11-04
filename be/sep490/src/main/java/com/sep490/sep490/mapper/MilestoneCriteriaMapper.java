package com.sep490.sep490.mapper;

import com.sep490.sep490.dto.AssignmentDTO;
import com.sep490.sep490.dto.EvaluationCriteriaDTO;
import com.sep490.sep490.dto.evaluationCriteria.request.MilestoneCriteriaRequest;
import com.sep490.sep490.entity.Assignment;
import com.sep490.sep490.entity.EvaluationCriteria;
import com.sep490.sep490.entity.MilestoneCriteria;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Data
@AllArgsConstructor
@Component
public class MilestoneCriteriaMapper {
    private static final ModelMapper modelMapper = new ModelMapper();
    public MilestoneCriteria convertMilestoneCriteriaRequestToMilestoneCriteria(
            MilestoneCriteriaRequest request,
            MilestoneCriteria parentMilestoneCriteria){
        MilestoneCriteria response = new MilestoneCriteria();
        response.setMilestone(parentMilestoneCriteria.getMilestone());
        response.setCriteriaName(request.getCriteriaName());
//        response.setParentCriteria(parentMilestoneCriteria);
        response.setEvalWeight(request.getEvalWeight());
        response.setNote(request.getNote());
        return response;
    }

    public MilestoneCriteria convertToUpdateMilestone(
            MilestoneCriteriaRequest request,
            MilestoneCriteria response){
        response.setCriteriaName(request.getCriteriaName());
        response.setEvalWeight(request.getEvalWeight());
        response.setNote(request.getNote());
        return response;
    }

    public MilestoneCriteria deactivateMilestoneCriteria(
            MilestoneCriteria response){
        response.setActive(false);
        return response;
    }

}

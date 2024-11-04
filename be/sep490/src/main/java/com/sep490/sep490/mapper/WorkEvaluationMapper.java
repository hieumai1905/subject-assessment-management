package com.sep490.sep490.mapper;

import com.sep490.sep490.dto.SearchReqEvalResponseDTO;
import com.sep490.sep490.entity.WorkEvaluation;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Data
@AllArgsConstructor
@Component
public class WorkEvaluationMapper {
    private static final ModelMapper modelMapper = new ModelMapper();
    public SearchReqEvalResponseDTO mapReverse(WorkEvaluation workEvaluation,SearchReqEvalResponseDTO responseDTO){
        SearchReqEvalResponseDTO response=modelMapper.map(workEvaluation,SearchReqEvalResponseDTO.class);
        response.setClassId(workEvaluation.getMilestone().getClasses().getId());
        response.setClassName(workEvaluation.getMilestone().getClasses().getName());
        response.setTeamId(workEvaluation.getRequirement().getTeam().getId());
        response.setTeamName(workEvaluation.getRequirement().getTeam().getTeamName());
        response.setStudentId(workEvaluation.getStudent().getId());
        response.setStudentName(workEvaluation.getStudent().getFullname());
        response.setMilestoneId(workEvaluation.getMilestone().getId());
        response.setMilestoneTitle(workEvaluation.getMilestone().getTitle());
       // response.setParentReqId(workEvaluation.getRequirement().get);
        response.setStatusReq(workEvaluation.getRequirement().getStatus());
        response.setGrade(workEvaluation.getGrade());
        response.setComplexity(workEvaluation.getComplexity().getName());
        response.setComplexityId(workEvaluation.getComplexity().getId());
        response.setQualityId(workEvaluation.getQuality().getId());
        response.setQuality(workEvaluation.getQuality().getDescription());
        return response;
    }
}

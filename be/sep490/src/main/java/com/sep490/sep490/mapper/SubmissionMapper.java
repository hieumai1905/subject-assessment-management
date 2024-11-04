package com.sep490.sep490.mapper;

import com.sep490.sep490.dto.RequirementDTO;
import com.sep490.sep490.dto.SettingDTO;
import com.sep490.sep490.dto.SubmissionDTO;
import com.sep490.sep490.entity.Milestone;
import com.sep490.sep490.entity.Setting;
import com.sep490.sep490.entity.Submission;
import com.sep490.sep490.entity.Team;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.List;

@Data
@AllArgsConstructor
@Component
public class SubmissionMapper {
    private static final ModelMapper modelMapper = new ModelMapper();

    public SubmissionDTO convertSubmissionToSubmissionDTO(Submission request,
                                                          Team team,
                                                          Milestone milestone,
                                                          List<RequirementDTO> requirementDTOS) {
        SubmissionDTO response = new SubmissionDTO();
        response.setId(request.getId());
        response.setTeamName(team.getTeamName());
        response.setTeamId(team.getId());
        response.setMileName(milestone.getTitle());
        response.setUpdateBy(request.getUpdatedBy());
        response.setSubmitFile(request.getSubmitFile());
        response.setSubmitLink(request.getSubmitLink());
        response.setSubmitAt(request.getUpdatedDate());
        response.setStatus(request.getStatus());
        response.setNote(request.getNote());
        response.setRequirementDTOS(requirementDTOS);
        return response;
    }
}

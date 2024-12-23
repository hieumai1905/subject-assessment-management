package com.sep490.sep490.dto.requirement.request;

import com.sep490.sep490.common.utils.ValidateUtils;
import com.sep490.sep490.dto.RequirementDTO;
import lombok.Data;

import java.util.List;

@Data
public class AddRequirementList {
    private List<RequirementDTO> requirementDTOs;
    private Integer milestoneId;
    private List<Integer> teamIds;

    public void validateInput(){
        ValidateUtils.checkNullOrEmpty(milestoneId, "Giai đoạn");
        ValidateUtils.checkNullOrEmpty(teamIds, "Nhóm");
        for (Integer teamId : teamIds) {
            ValidateUtils.checkNullOrEmpty(teamId, "Nhóm");
        }
        for (RequirementDTO requirement : requirementDTOs) {
            ValidateUtils.checkNullOrEmpty(requirement, "Yêu cầu");
            requirement.setStatus("TO DO");
            requirement.validateInput(true);
        }
    }
}

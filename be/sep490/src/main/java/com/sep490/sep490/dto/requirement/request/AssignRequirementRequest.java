package com.sep490.sep490.dto.requirement.request;

import com.sep490.sep490.common.utils.ValidateUtils;
import lombok.Data;

@Data
public class AssignRequirementRequest {
    Integer memberId;
    Integer requirementId;
    Integer teamId;
    public void validateInput(){
        ValidateUtils.checkNullOrEmpty(memberId, "Member id");
        ValidateUtils.checkNullOrEmpty(requirementId, "Requirement id");
        ValidateUtils.checkNullOrEmpty(teamId, "Team id");
    }
}

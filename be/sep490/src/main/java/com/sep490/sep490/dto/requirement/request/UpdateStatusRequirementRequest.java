package com.sep490.sep490.dto.requirement.request;

import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.ValidateUtils;
import lombok.Data;

@Data
public class UpdateStatusRequirementRequest {
    String status;
    Integer requirementId;
    Integer teamId;
    public void validateInput(){
        ValidateUtils.checkNullOrEmpty(requirementId, "Requirement id");
        ValidateUtils.checkNullOrEmpty(teamId, "Team id");
        ValidateUtils.checkNullOrEmpty(status, "Status");

        status = (ValidateUtils.checkExistedInList(Constants.RequirementStatus.REQUIREMENT_STATUSES, status,
                "Status", Constants.RequirementStatus.REQUIREMENT_STATUSES.get(0)));
    }
}

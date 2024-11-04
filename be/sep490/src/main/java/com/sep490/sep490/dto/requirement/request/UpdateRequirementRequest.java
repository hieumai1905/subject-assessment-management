package com.sep490.sep490.dto.requirement.request;

import com.sep490.sep490.common.exception.ApiInputException;
import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.ValidateUtils;
import com.sep490.sep490.dto.requirement.BaseRequirementDTO;
import lombok.Data;

import java.util.List;

@Data
public class UpdateRequirementRequest {
    private String reqTitle;
    private String reqType;
    private String note;
    private Integer complexityId;
    private Integer studentId;
    private String status;
    private List<Integer> requirementIds;

    public void validateInput(){
        ValidateUtils.checkNullOrEmpty(requirementIds, "Requirement ids");
        for (Integer requirementId : requirementIds) {
            ValidateUtils.checkNullOrEmpty(requirementId, "Requirement id");
        }
        if(status != null)
            status = ValidateUtils.checkExistedInList(Constants.RequirementStatus.REQUIREMENT_STATUSES, status,
                    "status", Constants.RequirementStatus.REQUIREMENT_STATUSES.get(0));
        reqTitle = ValidateUtils.checkLength(reqTitle, "Requirement title", 0, 255);
        reqType = ValidateUtils.checkLength(reqType, "Requirement type", 0, 255);
        note = ValidateUtils.checkLength(note, "Note", 0, Constants.DefaultValueEntity.DESCRIPTION_LENGTH);
    }
}

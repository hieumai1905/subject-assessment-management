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
        ValidateUtils.checkNullOrEmpty(requirementIds, "Yêu cầu");
        for (Integer requirementId : requirementIds) {
            ValidateUtils.checkNullOrEmpty(requirementId, "Yêu cầu");
        }
        if(status != null)
            status = ValidateUtils.checkExistedInList(Constants.RequirementStatus.REQUIREMENT_STATUSES, status,
                    "Trạng thái", Constants.RequirementStatus.REQUIREMENT_STATUSES.get(0));
        reqTitle = ValidateUtils.checkLength(reqTitle, "Tiêu đề", 0, 255);
        reqType = ValidateUtils.checkLength(reqType, "Tiêu đề", 0, 255);
        note = ValidateUtils.checkLength(note, "Ghi chú", 0, Constants.DefaultValueEntity.DESCRIPTION_LENGTH);
    }
}

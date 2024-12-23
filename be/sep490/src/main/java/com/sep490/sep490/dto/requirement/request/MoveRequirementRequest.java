package com.sep490.sep490.dto.requirement.request;

import com.sep490.sep490.common.utils.ValidateUtils;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class MoveRequirementRequest {
    private Integer milestoneId;
    private List<Integer> requirementIds;
    private List<Integer> teamIds;
    public void validateInput(){
        ValidateUtils.checkNullOrEmpty(milestoneId, "Giai đoạn");
        ValidateUtils.checkNullOrEmpty(requirementIds, "Yêu cầu");
        for (Integer reqId : requirementIds) {
            ValidateUtils.checkNullOrEmpty(reqId, "Yêu cầu");
        }
        if(teamIds != null && teamIds.size() > 0){
            for (Integer teamId : teamIds) {
                ValidateUtils.checkNullOrEmpty(teamId, "Nhóm");
            }
        }
    }
}

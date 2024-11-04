package com.sep490.sep490.dto;

import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.ValidateUtils;
import com.sep490.sep490.dto.requirement.BaseRequirementDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
public class RequirementDTO{
    private Integer id;
    private String reqTitle;
    private String note;
    private Integer teamId;
    private String teamTeamName;
    private Integer complexityId;
    private String complexityName;
    private String status;
    private String submission;
    private String submitType;
    private Integer studentId;
    private String studentFullname;
    private Integer milestoneId;
    private String milestoneTitle;
    private List<Integer> teamIds;
    private List<UpdateTrackingDTO> updateTrackings;
    public void validateInput(boolean isAddList){
        ValidateUtils.checkNullOrEmpty(reqTitle, "Requirement title");
        status = ValidateUtils.checkExistedInList(Constants.RequirementStatus.REQUIREMENT_STATUSES, status,
                "status", Constants.RequirementStatus.REQUIREMENT_STATUSES.get(0));
        reqTitle = ValidateUtils.checkLength(reqTitle, "Requirement title", 1, 255);
        note = ValidateUtils.checkLength(note, "Note", 0, Constants.DefaultValueEntity.DESCRIPTION_LENGTH);
        if(!isAddList){
            ValidateUtils.checkNullOrEmpty(teamIds, "Team ids");
            for (Integer teamId : teamIds) {
                ValidateUtils.checkNullOrEmpty(teamId, "Team id");
            }
            ValidateUtils.checkNullOrEmpty(milestoneId, "Milestone");
        }
    }
}

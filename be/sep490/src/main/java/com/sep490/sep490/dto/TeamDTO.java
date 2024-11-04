package com.sep490.sep490.dto;

import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.ValidateUtils;
import com.sep490.sep490.dto.user.request.CreateUserRequest;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Data
@RequiredArgsConstructor
public class TeamDTO {
    private Integer id;
    private String teamName;
    private String topicName;
    private String note;
    private Boolean active;
    private Boolean teamOfCurrentMilestone;
    private Integer milestoneId;
    private Integer leaderId;
    private List<CreateUserRequest> members;
    private List<RequirementDTO> requirementDTOs;

    public void validateInput(){
        ValidateUtils.checkNullOrEmpty(teamName, "Team name");
        teamName = ValidateUtils.checkLength(teamName, "Team name", Constants.LengthCheck.MIN, Constants.LengthCheck.MAX);
//        ValidateUtils.checkNullOrEmpty(topicName, "Topic name");
        topicName = ValidateUtils.checkLength(topicName, "Topic name", 0, Constants.LengthCheck.MAX);
        ValidateUtils.checkNullOrEmpty(milestoneId, "Milestone");
        note = ValidateUtils.checkLength(note, "Note", Constants.DefaultValueEntity.MIN_LENGTH, Constants.DefaultValueEntity.DESCRIPTION_LENGTH);
    }
}

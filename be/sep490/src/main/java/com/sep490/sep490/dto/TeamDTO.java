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
    private Integer classId;
    private Integer leaderId;
    private String leaderCode;
    private List<CreateUserRequest> members;
    private List<RequirementDTO> requirementDTOs;

    public void validateInput(){
        ValidateUtils.checkNullOrEmpty(teamName, "Tên nhóm");
        teamName = ValidateUtils.checkLength(teamName, "Tên nhóm", Constants.LengthCheck.MIN, Constants.LengthCheck.MAX);
//        ValidateUtils.checkNullOrEmpty(topicName, "Topic name");
        topicName = ValidateUtils.checkLength(topicName, "Tên chủ đề", 0, Constants.LengthCheck.MAX);
        ValidateUtils.checkNullOrEmpty(classId, "Lớp học");
        note = ValidateUtils.checkLength(note, "Ghi chú", Constants.DefaultValueEntity.MIN_LENGTH, Constants.DefaultValueEntity.DESCRIPTION_LENGTH);
    }
}

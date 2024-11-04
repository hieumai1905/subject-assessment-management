package com.sep490.sep490.dto.councilTeam.request;

import com.sep490.sep490.common.utils.ValidateUtils;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class UpdateCouncilTeamStatus {
    private List<Integer> studentIds;
    private Integer councilTeamId;
    private Integer milestoneId;
    private String status;

    public void validateInput(){
        ValidateUtils.checkNullOrEmpty(studentIds, "Student ids");
        ValidateUtils.checkNullOrEmpty(status, "Status");
        ValidateUtils.checkNullOrEmpty(councilTeamId, "Council Team");
        ValidateUtils.checkNullOrEmpty(milestoneId, "Milestone");
    }
}

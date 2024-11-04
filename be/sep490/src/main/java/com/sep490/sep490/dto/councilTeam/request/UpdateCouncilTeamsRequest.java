package com.sep490.sep490.dto.councilTeam.request;

import com.sep490.sep490.common.utils.ValidateUtils;
import lombok.Data;

import java.util.List;

@Data
public class UpdateCouncilTeamsRequest {
    private Boolean isAssignedForClass;
    private List<Integer> ids;
    private Integer councilId;
    private Integer sessionId;
    private Integer semesterId;
    private Integer roundId;

    public void validateInput(){
        isAssignedForClass = isAssignedForClass != null && isAssignedForClass;
        ValidateUtils.checkNullOrEmpty(ids, "Assigned ids");
        ValidateUtils.checkNullOrEmpty(semesterId, "Semester id");
        ValidateUtils.checkNullOrEmpty(roundId, "Round id");
//        ValidateUtils.checkNullOrEmpty(councilId, "Council id");
//        ValidateUtils.checkNullOrEmpty(sessionId, "Session id");
    }
}

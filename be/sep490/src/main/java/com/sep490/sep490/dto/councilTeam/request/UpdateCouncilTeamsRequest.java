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
        ValidateUtils.checkNullOrEmpty(ids, "Thông tin lớp/nhóm");
        ValidateUtils.checkNullOrEmpty(semesterId, "Học kỳ");
        ValidateUtils.checkNullOrEmpty(roundId, "Lần chấm");
//        ValidateUtils.checkNullOrEmpty(councilId, "Council id");
//        ValidateUtils.checkNullOrEmpty(sessionId, "Session id");
    }
}

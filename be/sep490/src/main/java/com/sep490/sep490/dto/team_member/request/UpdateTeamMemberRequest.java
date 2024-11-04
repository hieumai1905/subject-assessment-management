package com.sep490.sep490.dto.team_member.request;

import com.sep490.sep490.common.exception.ApiInputException;
import com.sep490.sep490.common.utils.ValidateUtils;
import lombok.Data;

@Data
public class UpdateTeamMemberRequest {
    private Integer oldTeamId;
    private Integer newTeamId;
    private Integer memberId;

    public void validateInput(){
        ValidateUtils.checkNullOrEmpty(memberId, "Member id");
        if(oldTeamId == null && newTeamId == null)
            throw new ApiInputException("New team id or old team id must not be null!");
    }
}

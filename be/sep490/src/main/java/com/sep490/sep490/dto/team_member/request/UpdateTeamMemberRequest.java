package com.sep490.sep490.dto.team_member.request;

import com.sep490.sep490.common.exception.ApiInputException;
import com.sep490.sep490.common.utils.ValidateUtils;
import lombok.Data;

@Data
public class UpdateTeamMemberRequest {
    private Integer oldTeamId;
    private Integer newTeamId;
    private String memberId;

    public void validateInput(){
        ValidateUtils.checkNullOrEmpty(memberId, "Mã thành viên");
        if(oldTeamId == null && newTeamId == null)
            throw new ApiInputException("Bắt buộc phải có thông tin nhóm mới hoặc nhóm cũ");
    }
}

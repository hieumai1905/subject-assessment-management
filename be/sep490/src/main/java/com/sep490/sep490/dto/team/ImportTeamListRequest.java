package com.sep490.sep490.dto.team;

import com.sep490.sep490.common.utils.ValidateUtils;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ImportTeamListRequest {
    private Integer milestoneId;
    private Integer classId;
    private List<ImportTeamRequest> teams;

    public void validateInput(){
        ValidateUtils.checkNullOrEmpty(classId, "Lớp học");
        ValidateUtils.checkNullOrEmpty(teams, "Nhóm");

        for (ImportTeamRequest teamRequest : teams) {
            ValidateUtils.checkNullOrEmpty(teamRequest.getTeamName(), "Tên nhóm");
            teamRequest.setTeamName(ValidateUtils.checkLength(teamRequest.getTeamName(), "Tên nhóm", 1, 255));
            teamRequest.setTopicName(ValidateUtils.checkLength(teamRequest.getTopicName(), "Tên chủ đề", 0, 255));
            if(teamRequest.getMemberCodes() != null){
                for (String memberCode : teamRequest.getMemberCodes()) {
                    ValidateUtils.checkNullOrEmpty(memberCode, "Mã thành viên trong " + teamRequest.getTeamName());
                }
            }
        }
    }
}

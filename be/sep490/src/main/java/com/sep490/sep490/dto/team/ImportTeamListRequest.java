package com.sep490.sep490.dto.team;

import com.sep490.sep490.common.utils.ValidateUtils;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ImportTeamListRequest {
    private Integer milestoneId;
    private List<ImportTeamRequest> teams;

    public void validateInput(){
        ValidateUtils.checkNullOrEmpty(milestoneId, "Milestone Id");
        ValidateUtils.checkNullOrEmpty(teams, "Teams");

        for (ImportTeamRequest teamRequest : teams) {
            ValidateUtils.checkNullOrEmpty(teamRequest.getTeamName(), "Team name");
            teamRequest.setTeamName(ValidateUtils.checkLength(teamRequest.getTeamName(), "Team name", 1, 255));
            teamRequest.setTopicName(ValidateUtils.checkLength(teamRequest.getTopicName(), "Topic name", 0, 255));
            if(teamRequest.getMemberIds() != null){
                for (Integer memberId : teamRequest.getMemberIds()) {
                    ValidateUtils.checkNullOrEmpty(memberId, "Member id in team " + teamRequest.getTeamName());
                }
            }
        }
    }
}

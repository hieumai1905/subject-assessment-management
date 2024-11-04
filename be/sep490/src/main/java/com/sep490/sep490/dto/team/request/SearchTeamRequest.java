package com.sep490.sep490.dto.team.request;

import com.sep490.sep490.common.utils.ValidateUtils;
import lombok.Data;

@Data
public class SearchTeamRequest{
    private String teamName;
    private String topicName;
    private Integer milestoneId;

    public void validateInput(){
//        ValidateUtils.checkNullOrEmpty(milestoneId, "Milestone id");
        if(teamName != null)
            teamName = teamName.trim().toLowerCase();
        if (topicName != null)
            topicName = topicName.trim().toLowerCase();
    }
}

package com.sep490.sep490.dto.milestone.response;

import com.sep490.sep490.dto.MilestoneDTO;
import com.sep490.sep490.dto.team.response.ProgressOfTeam;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Data
public class MilestoneResponse extends MilestoneDTO {
    private List<ProgressOfTeam> progressOfTeams;
}

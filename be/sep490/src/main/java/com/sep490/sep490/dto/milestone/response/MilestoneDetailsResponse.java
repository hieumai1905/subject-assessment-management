package com.sep490.sep490.dto.milestone.response;

import com.sep490.sep490.dto.MilestoneDTO;
import com.sep490.sep490.dto.evaluationCriteria.response.MilestoneCriteriaResponse;
import com.sep490.sep490.dto.team.response.ProgressOfTeam;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Data
@RequiredArgsConstructor
public class MilestoneDetailsResponse {
    private MilestoneDTO milestone;
    private List<MilestoneCriteriaResponse> milestoneCriterias;
}

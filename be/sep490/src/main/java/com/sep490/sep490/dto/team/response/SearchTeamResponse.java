package com.sep490.sep490.dto.team.response;

import com.sep490.sep490.dto.TeamDTO;
import lombok.Data;

import java.util.List;

@Data
public class SearchTeamResponse {
    private List<TeamDTO> teamDTOs;
}

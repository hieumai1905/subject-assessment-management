package com.sep490.sep490.dto.councilTeam.response;

import com.sep490.sep490.dto.*;
import com.sep490.sep490.entity.CouncilTeam;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Data
public class SearchCouncilTeamResponse extends SearchRequestDTO {
    private List<CouncilDTO> councilDTOs;
    private List<BaseDTO> sessionDTOs;
    private List<CouncilTeamDTO> councilTeams;
    private String sortBy;
    private Integer totalElements;
}

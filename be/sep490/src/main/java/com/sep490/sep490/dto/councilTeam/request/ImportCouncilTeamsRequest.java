package com.sep490.sep490.dto.councilTeam.request;

import com.sep490.sep490.common.utils.ValidateUtils;
import lombok.Data;

import java.util.List;

@Data
public class ImportCouncilTeamsRequest {
    private Boolean isAssignedForClass;
    private List<ImportCouncilTeam> importedTeams;
    private Integer roundId;
    private Integer semesterId;

    public void validateInput(){
        isAssignedForClass = isAssignedForClass != null && isAssignedForClass;
        ValidateUtils.checkNullOrEmpty(importedTeams, "Import data");
        ValidateUtils.checkNullOrEmpty(semesterId, "Semester id");
        ValidateUtils.checkNullOrEmpty(roundId, "Round id");
        for (ImportCouncilTeam request : importedTeams) {
            request.validateInput();
        }
    }
}

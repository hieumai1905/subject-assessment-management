package com.sep490.sep490.dto.councilTeam.request;

import com.sep490.sep490.common.utils.SortAndOrderUtils;
import com.sep490.sep490.dto.SearchRequestDTO;
import com.sep490.sep490.entity.CouncilTeam;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class SearchCouncilTeamRequest extends SearchRequestDTO {
    private Integer classId;
    private Integer teamId;
    private Integer semesterId;
    private Integer subjectId;
    private Integer roundId;
    private String sortBy;
    private Boolean isSearchClass;

    public void validateInput(){
        super.validateInput();
        isSearchClass = isSearchClass != null && isSearchClass;
        sortBy = SortAndOrderUtils.validateSort(sortBy, "id", CouncilTeam.class.getDeclaredFields());
    }
}

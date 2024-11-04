package com.sep490.sep490.dto.requirement.request;

import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.SortAndOrderUtils;
import com.sep490.sep490.common.utils.ValidateUtils;
import com.sep490.sep490.dto.SearchRequestDTO;
import com.sep490.sep490.entity.Classes;
import com.sep490.sep490.entity.Requirement;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Data
public class SearchRequirementRequest extends SearchRequestDTO {
    private Integer teamId;
    private Integer milestoneId;
    private String status;
    private String sortBy;
    private String title;
    private Integer userId;
    private Integer parentId;
    private Integer complexityId;
    private Boolean isCurrentRequirements;

    public void validateInput(){
        super.validateInput();
        if(title != null)
            title = title.trim().toLowerCase();
        if(status != null)
            status = status.trim().toLowerCase();
        isCurrentRequirements = isCurrentRequirements != null && isCurrentRequirements;
        sortBy = SortAndOrderUtils.validateSort(sortBy, Constants.DefaultValuePage.SORT_BY, Requirement.class.getDeclaredFields());
    }
}

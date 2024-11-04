package com.sep490.sep490.dto.milestone.request;

import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.SortAndOrderUtils;
import com.sep490.sep490.dto.SearchRequestDTO;
import com.sep490.sep490.entity.Milestone;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class SearchMilestoneRequest extends SearchRequestDTO {
    private Integer classId;
    private Integer assignmentId;
    private Boolean active;
    private String sortBy;
    public void validateInput(){
        super.validateInput();
        sortBy = SortAndOrderUtils.validateSort(sortBy, Constants.DefaultValuePage.SORT_BY, Milestone.class.getDeclaredFields());
    }
}

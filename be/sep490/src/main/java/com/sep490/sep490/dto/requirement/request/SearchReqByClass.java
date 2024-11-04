package com.sep490.sep490.dto.requirement.request;

import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.SortAndOrderUtils;
import com.sep490.sep490.common.utils.ValidateUtils;
import com.sep490.sep490.dto.SearchRequestDTO;
import com.sep490.sep490.entity.Requirement;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class SearchReqByClass extends SearchRequestDTO {
    private Integer classId;
    private String sortBy;
    private Integer milestoneId;
    private Integer teamId;
    private String title;

    public void validateInput(){
        super.validateInput();
        ValidateUtils.checkNullOrEmpty(classId, "classId");
        if(title != null){
            title = title.trim().toLowerCase();
        }
        sortBy = SortAndOrderUtils.validateSort(sortBy, Constants.DefaultValuePage.SORT_BY, Requirement.class.getDeclaredFields());
    }
}

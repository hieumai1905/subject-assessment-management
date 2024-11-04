package com.sep490.sep490.dto.assignment.request;

import com.sep490.sep490.common.exception.ConflictException;
import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.SortAndOrderUtils;
import com.sep490.sep490.dto.SearchRequestDTO;
import com.sep490.sep490.entity.Assignment;
import com.sep490.sep490.entity.Setting;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class SearchAssignmentRequest extends SearchRequestDTO {
    private  Integer subjectId;
    private  Integer minExpectedLoc;
    private  Integer maxExpectedLoc;
    private  String title;
    private  Boolean active;
    private String sortBy;
    public void validateInput(){
        super.validateInput();

        if(title != null){
            title = title.trim().toLowerCase();
        }

        sortBy = SortAndOrderUtils.validateSort(sortBy, Constants.DefaultValuePage.SORT_BY, Assignment.class.getDeclaredFields());
    }
}

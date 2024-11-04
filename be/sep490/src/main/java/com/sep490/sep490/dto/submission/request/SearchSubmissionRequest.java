package com.sep490.sep490.dto.submission.request;

import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.SortAndOrderUtils;
import com.sep490.sep490.common.utils.ValidateUtils;
import com.sep490.sep490.dto.SearchRequestDTO;
import com.sep490.sep490.entity.Setting;
import com.sep490.sep490.entity.Submission;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class SearchSubmissionRequest extends SearchRequestDTO {
    private Integer teamId;
    private Integer milestoneId;
    private Boolean isSearchGrandFinal;
    private String sortBy;

    public void validateInput(){
        super.validateInput();
        isSearchGrandFinal = isSearchGrandFinal != null && isSearchGrandFinal;
//        ValidateUtils.checkNullOrEmpty(milestoneId, "Milestone id");
//        ValidateUtils.checkNullOrEmpty(teamId, "Team id");
        sortBy = SortAndOrderUtils.validateSort(sortBy, Constants.DefaultValuePage.SORT_BY, Submission.class.getDeclaredFields());
    }
}

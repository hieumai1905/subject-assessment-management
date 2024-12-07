package com.sep490.sep490.dto.subject.request;

import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.SortAndOrderUtils;
import com.sep490.sep490.dto.SearchRequestDTO;
import com.sep490.sep490.entity.Subject;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class SearchSubjectRequest extends SearchRequestDTO {
    private String nameOrCode;
    private Integer managerId;
    private Boolean active;
    private Boolean isCouncil;
    private String sortBy;

    public void validateInput(){
        super.validateInput();

        if(nameOrCode != null)
            nameOrCode = nameOrCode.trim().toLowerCase();

        sortBy = SortAndOrderUtils.validateSort(sortBy, Constants.DefaultValuePage.SORT_BY, Subject.class.getDeclaredFields());
    }
}

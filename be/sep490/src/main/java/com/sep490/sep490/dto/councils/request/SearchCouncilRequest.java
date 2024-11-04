package com.sep490.sep490.dto.councils.request;

import com.sep490.sep490.common.utils.SortAndOrderUtils;
import com.sep490.sep490.dto.SearchRequestDTO;
import com.sep490.sep490.entity.Council;
import com.sep490.sep490.entity.Session;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class SearchCouncilRequest extends SearchRequestDTO {
    private Integer semesterId;
    private Integer settingId;
    private String sortBy;

    public void validateInput(){
        super.validateInput();
        sortBy = SortAndOrderUtils.validateSort(sortBy, "id", Council.class.getDeclaredFields());
    }
}

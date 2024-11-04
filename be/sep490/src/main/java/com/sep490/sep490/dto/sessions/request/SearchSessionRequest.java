package com.sep490.sep490.dto.sessions.request;

import com.sep490.sep490.common.utils.SortAndOrderUtils;
import com.sep490.sep490.common.utils.ValidateUtils;
import com.sep490.sep490.dto.SearchRequestDTO;
import com.sep490.sep490.entity.Session;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class SearchSessionRequest extends SearchRequestDTO {
    private Integer semesterId;
    private Integer settingId;
    private String sortBy;

    public void validateInput(){
        super.validateInput();
        sortBy = SortAndOrderUtils.validateSort(sortBy, "id", Session.class.getDeclaredFields());
    }
}

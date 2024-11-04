package com.sep490.sep490.dto.subjectsetting.request;

import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.SortAndOrderUtils;
import com.sep490.sep490.dto.SearchRequestDTO;
import com.sep490.sep490.entity.Setting;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class SearchSubjectSettingRequest extends SearchRequestDTO {
    private String name;
    private String type;
    private Boolean active;
    private Integer subjectId;
    private String sortBy;
    public void validateInput(){
        super.validateInput();

        if(name != null)
            name = name.trim().toLowerCase();

        sortBy = SortAndOrderUtils.validateSort(sortBy, Constants.DefaultValuePage.SORT_BY, Setting.class.getDeclaredFields());
    }
}

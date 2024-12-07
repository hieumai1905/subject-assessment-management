package com.sep490.sep490.dto.setting.request;

import com.sep490.sep490.common.exception.ApiInputException;
import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.SortAndOrderUtils;
import com.sep490.sep490.dto.SearchRequestDTO;
import com.sep490.sep490.entity.Setting;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class SearchSettingRequest extends SearchRequestDTO {
    private String name;
    private String type;
    private Integer subjectId;
    private Boolean active;
    private Boolean isSubjectSetting;
    private String sortBy;

    public void validateInput(){
        super.validateInput();

        if(name != null)
            name = name.trim().toLowerCase();
        isSubjectSetting = isSubjectSetting != null && isSubjectSetting;
        if(isSubjectSetting && subjectId == null)
            throw new ApiInputException("Môn học");

        sortBy = SortAndOrderUtils.validateSort(sortBy, Constants.DefaultValuePage.SORT_BY, Setting.class.getDeclaredFields());
    }
}

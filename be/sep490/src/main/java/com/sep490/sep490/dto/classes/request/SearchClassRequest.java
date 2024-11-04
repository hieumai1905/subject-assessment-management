package com.sep490.sep490.dto.classes.request;

import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.SortAndOrderUtils;
import com.sep490.sep490.dto.SearchRequestDTO;
import com.sep490.sep490.entity.Classes;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class SearchClassRequest  extends SearchRequestDTO {
    private Integer subjectId;
    private Integer teacherId;
    private Integer settingId;
    private Boolean isCurrentClass;
//    private String name;
    private String keyWord;
    private String sortBy;
    private Boolean active;
    public void validateInput(){
        super.validateInput();

        if(keyWord != null){
            keyWord = keyWord.trim().toLowerCase();
        }else {
            keyWord="";
        }
        isCurrentClass = isCurrentClass != null && isCurrentClass;
        sortBy = SortAndOrderUtils.validateSort(sortBy, Constants.DefaultValuePage.SORT_BY, Classes.class.getDeclaredFields());
    }
}

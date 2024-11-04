package com.sep490.sep490.dto.subject.request;

import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.SortAndOrderUtils;
import com.sep490.sep490.dto.SearchRequestDTO;
import com.sep490.sep490.entity.Subject;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class SearchSubjectTeacherRequest extends SearchRequestDTO {
    private Integer subjectId;
    private String keyWord;
    private String type;
    private String sortBy;
    public void validateInput(){
        super.validateInput();

        if(keyWord != null)
            keyWord = keyWord.trim().toLowerCase();
        sortBy = SortAndOrderUtils.validateSort(sortBy, Constants.DefaultValuePage.SORT_BY, Subject.class.getDeclaredFields());
    }
}

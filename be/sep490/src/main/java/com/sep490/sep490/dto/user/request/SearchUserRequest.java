package com.sep490.sep490.dto.user.request;

import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.SortAndOrderUtils;
import com.sep490.sep490.dto.SearchRequestDTO;
import com.sep490.sep490.entity.User;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class SearchUserRequest extends SearchRequestDTO {
    private String keyWord;
    private String roleName;
    private Boolean active;
    private String status;
    private String sortBy;

    public void validateInput(){
        super.validateInput();

        if(keyWord != null)
            keyWord = keyWord.trim().toLowerCase();
        if(roleName != null)
            roleName = roleName.trim().toLowerCase();

        sortBy = SortAndOrderUtils.validateSort(sortBy, Constants.DefaultValuePage.SORT_BY, User.class.getDeclaredFields());
    }
}

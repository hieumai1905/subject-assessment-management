package com.sep490.sep490.dto.classes.request;

import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.SortAndOrderUtils;
import com.sep490.sep490.common.utils.ValidateUtils;
import com.sep490.sep490.dto.SearchRequestDTO;
import com.sep490.sep490.entity.ClassUser;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class SearchClassStudentRequest extends SearchRequestDTO {
    private Integer classId;
    private String keyWord;
    private Integer roleId;
    private String sortBy;

    public void validateInput(){
        super.validateInput();
        ValidateUtils.checkNullOrEmpty(classId, "Class id");
        if(keyWord==null){
            keyWord="";
        }else{
            keyWord=ValidateUtils.checkLength(keyWord,"keyWord",0,255);
        }

            ValidateUtils.checkIntegerInRange(roleId,"role Id",0,4);

      //  ValidateUtils.checkNullOrEmpty(roleId, "Role id ");
        sortBy = SortAndOrderUtils.validateSort(sortBy, Constants.DefaultValuePage.SORT_BY, ClassUser.class.getDeclaredFields());

    }
}

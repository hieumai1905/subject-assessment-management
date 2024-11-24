package com.sep490.sep490.dto.classes.request;

import com.sep490.sep490.common.exception.ApiInputException;
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
    private String year;
    private String sortBy;

    public void validateInput(){
        super.validateInput();
        ValidateUtils.checkNullOrEmpty(classId, "Lớp học");
        if(keyWord != null){
            keyWord = keyWord.trim().toLowerCase();
        } else{
            keyWord = "";
        }
        try{
            if(year != null && !year.isBlank()){
                int yearNum = Integer.parseInt(year);
                if(yearNum <= 0){
                    throw new ApiInputException("Năm học phải là số dương");
                }
                if(year.length() > 2)
                    year = year.substring(year.length() - 2);
            }else{
                year = null;
            }
        }catch (NumberFormatException ex){
            throw new ApiInputException("Năm học phải là số dương");
        }

        sortBy = SortAndOrderUtils.validateSort(sortBy, Constants.DefaultValuePage.SORT_BY, ClassUser.class.getDeclaredFields());
    }
}

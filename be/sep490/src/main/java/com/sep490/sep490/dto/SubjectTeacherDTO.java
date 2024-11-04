package com.sep490.sep490.dto;

import com.sep490.sep490.common.exception.ApiInputException;
import com.sep490.sep490.common.utils.ValidateUtils;
import com.sep490.sep490.dto.user.SubjectUserDTO;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@RequiredArgsConstructor
public class SubjectTeacherDTO {
    private Integer subjectId;
    private List<Integer> teacherIds;

    //check request
    public void validateInput() {
        ValidateUtils.checkNullOrEmpty(subjectId, "subjectId");
//        ValidateUtils.checkNullOrEmpty(teacherIds, "List id teacher");
        if(teacherIds != null){
            for(Integer i : teacherIds){
                if (i == null || i <= 0){
                    throw new ApiInputException("Id teacher is null or <= 0");
                }
            }
        }else{
            teacherIds = new ArrayList<>();
        }

    }
}

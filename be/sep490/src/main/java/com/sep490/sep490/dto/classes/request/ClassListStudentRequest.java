package com.sep490.sep490.dto.classes.request;

import com.sep490.sep490.common.utils.ValidateUtils;
import com.sep490.sep490.dto.user.request.CreateUserRequest;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@RequiredArgsConstructor
public class ClassListStudentRequest {
    private Integer classId;
    private Boolean isDeleteOldStudent;
    private List<CreateUserRequest> list;


    public void validateInput(){
        ValidateUtils.checkNullOrEmpty(classId,"Lớp học");
        ValidateUtils.checkNullOrEmpty(list,"Danh sách học sinh");
        if(isDeleteOldStudent == null)
            isDeleteOldStudent = true;
    }
}

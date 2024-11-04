package com.sep490.sep490.dto.classes.request;

import com.sep490.sep490.common.utils.ValidateUtils;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@AllArgsConstructor
@RequiredArgsConstructor
public class DeleteClassStudentDTO {
    private Integer classId;
    private Integer studentId;
    public  void validateInput(){
        ValidateUtils.checkNullOrEmpty(studentId,"StudentID");
        ValidateUtils.checkNullOrEmpty(classId,"classId");
    }


}

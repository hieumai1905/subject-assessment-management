package com.sep490.sep490.dto;

import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.ValidateUtils;
import com.sep490.sep490.dto.user.request.CreateUserRequest;
import jakarta.persistence.Column;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Data
@RequiredArgsConstructor
public class ClassesDTO {
    private Integer id;
    private Integer subjectId;
    private String subjectName;
    private Integer teacherId;
    private String teacherName;
    private Integer semesterId;
    private String semesterName;
    private String classCode;
    private String name;
    private String description;
    //validate: id teacher
    private List<CreateUserRequest> listEvaluator;
    private Boolean active;
    public void validateInput(){
        ValidateUtils.checkNullOrEmpty(classCode, "Class code");
        name = ValidateUtils.checkLength(name, "Class name", 0, 255);
        classCode = ValidateUtils.checkLength(classCode, "Class code", 1, 255);
        description = ValidateUtils.checkLength(description, "Class description", 0, Constants.DefaultValueEntity.DESCRIPTION_LENGTH);
    }
}

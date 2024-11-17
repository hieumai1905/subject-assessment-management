package com.sep490.sep490.dto;

import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.ValidateUtils;
import com.sep490.sep490.dto.user.SubjectUserDTO;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Data
@RequiredArgsConstructor
public class SubjectDTO {
    private Integer id;
    private List<SubjectUserDTO> managers;
    private Boolean active;
    private Boolean isCouncil;
    private String subjectCode;
    private String subjectName;
    private String description;

    public void validateInput(){
        ValidateUtils.checkNullOrEmpty(subjectCode, "Mã môn học");
        subjectCode = ValidateUtils.checkLength(subjectCode, "Mã môn học", 1, 255);

        ValidateUtils.checkNullOrEmpty(subjectName, "Tên môn học");
        subjectName = ValidateUtils.checkLength(subjectName, "Tên môn học", 1, 255);

        description = ValidateUtils.checkLength(description, "Mô tả", 0, Constants.DefaultValueEntity.DESCRIPTION_LENGTH);
    }
}

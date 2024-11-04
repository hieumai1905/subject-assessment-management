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
    private String subjectCode;
    private String subjectName;
    private String description;

    public void validateInput(){
        ValidateUtils.checkNullOrEmpty(subjectCode, "Subject code");
        subjectCode = ValidateUtils.checkLength(subjectCode, "Subject code", 1, 255);

        ValidateUtils.checkNullOrEmpty(subjectName, "Subject name");
        subjectName = ValidateUtils.checkLength(subjectName, "Subject name", 1, 255);

        description = ValidateUtils.checkLength(description, "Description", 0, Constants.DefaultValueEntity.DESCRIPTION_LENGTH);
    }
}

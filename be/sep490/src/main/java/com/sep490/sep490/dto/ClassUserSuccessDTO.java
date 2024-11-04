package com.sep490.sep490.dto;

import com.sep490.sep490.common.utils.ValidateUtils;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class ClassUserSuccessDTO {
    private Integer id;
    private Integer classesId;
    private String classCode;
    private Integer userId;
    private String fullname;
    private String email;
    private String note;
    private String phone;
    private String role;
    private Boolean active;
    public  void validateInput(){
        ValidateUtils.checkNullOrEmpty(note, "note about student in class");
        note = ValidateUtils.checkLength(note, "note about student in class", 0, 255);
    }
}

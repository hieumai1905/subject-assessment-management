package com.sep490.sep490.dto;

import com.sep490.sep490.common.utils.ValidateUtils;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class ClassUserSuccessDTO {
    private Integer id;
    private String code;
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
        ValidateUtils.checkNullOrEmpty(note, "Ghi chú");
        note = ValidateUtils.checkLength(note, "Ghi chú", 0, 255);
    }
}

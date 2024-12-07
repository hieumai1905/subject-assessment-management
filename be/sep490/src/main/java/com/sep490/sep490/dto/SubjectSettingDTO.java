package com.sep490.sep490.dto;

import com.sep490.sep490.common.utils.ValidateUtils;
import jakarta.persistence.Column;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class SubjectSettingDTO {
    private Integer id;
    private String name;
    private String extValue;
    private String settingType;
    private Integer displayOrder;
    private Boolean active;
    private String note;
    private Integer subjectId;
    public void validateInput(){
        ValidateUtils.checkNullOrEmpty(name, "Tên");
        name = ValidateUtils.checkLength(name, "Tên", 1, 255);
        note = ValidateUtils.checkLength(note, "Ghi chú", 0, 255);

        ValidateUtils.checkNullOrEmpty(settingType, "Loại cấu hình");
        settingType = ValidateUtils.checkLength(settingType, "Loại cấu hình", 1, 255);

        ValidateUtils.checkLength(extValue, "Giá trị", 1, 255);

        ValidateUtils.checkIntegerInRange(displayOrder, "Thứ tự hiện thị", 0, Integer.MAX_VALUE);
    }
}

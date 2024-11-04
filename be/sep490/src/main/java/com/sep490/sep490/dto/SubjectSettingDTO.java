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
        ValidateUtils.checkNullOrEmpty(name, "Subject Setting name");
        name = ValidateUtils.checkLength(name, "Subject Setting name", 1, 255);
        note = ValidateUtils.checkLength(note, "Subject Setting note", 0, 255);

        ValidateUtils.checkNullOrEmpty(settingType, "Subject Setting type");
        settingType = ValidateUtils.checkLength(settingType, "Subject Setting type", 1, 255);

        ValidateUtils.checkLength(extValue, "External value", 1, 255);

        ValidateUtils.checkIntegerInRange(displayOrder, "Display order", 0, Integer.MAX_VALUE);
    }
}

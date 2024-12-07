package com.sep490.sep490.dto;

import com.sep490.sep490.common.exception.ApiInputException;
import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.ValidateUtils;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class SettingDTO {
    private Integer id;
    private String name;
    private String extValue;
    private String settingType;
    private String description;
    private Integer displayOrder;
    private Integer subjectId;
    private Boolean active;

    public void validateInput(){
        ValidateUtils.checkNullOrEmpty(name, "Tên cấu hình");
        name = ValidateUtils.checkLength(name, "Tên cấu hình", 1, 255);
        ValidateUtils.checkNullOrEmpty(settingType, "Loại cấu hình");
        settingType = ValidateUtils.checkLength(settingType, "Loại cấu hình", 1, 255);
        ValidateUtils.checkLength(extValue, "Giá trị", 0, 255);
        ValidateUtils.checkIntegerInRange(displayOrder, "Thứ tự hiển thị", 0, Integer.MAX_VALUE);
        description = ValidateUtils.checkLength(description, "Mô tả", 0, Constants.DefaultValueEntity.DESCRIPTION_LENGTH);
        if(settingType.equals(Constants.SettingType.QUALITY) || settingType.equals(Constants.SettingType.COMPLEXITY)
                        || settingType.equals(Constants.SettingType.ROUND)){
            ValidateUtils.checkNullOrEmpty(subjectId, "Môn học");
            String message = "Giá trị độ phức tạp";
            if(settingType.equals(Constants.SettingType.QUALITY)){
                message = "Giá trị mức độ hoàn thiện";
            } else if(settingType.equals(Constants.SettingType.ROUND)){
                message = "Số phiên đánh giá";
            }
            ValidateUtils.checkNullOrEmpty(extValue, message);
            try{
                int extIntValue = Integer.parseInt(extValue);
                if(extIntValue <= 0)
                    throw new ApiInputException(message + " phải > 0!");
                if(settingType.equals(Constants.SettingType.QUALITY) && extIntValue > 100){
                    throw new ApiInputException(message + " phải <= 100%!");
                }
                extValue = extIntValue + "";
            }catch (NumberFormatException ex){
                throw new ApiInputException(message + " phải là số!");
            }
        }
    }
}

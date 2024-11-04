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
        ValidateUtils.checkNullOrEmpty(name, "Setting name");
        name = ValidateUtils.checkLength(name, "Setting name", 1, 255);
        ValidateUtils.checkNullOrEmpty(settingType, "Setting type");
        settingType = ValidateUtils.checkLength(settingType, "Setting type", 1, 255);
        ValidateUtils.checkLength(extValue, "External value", 0, 255);
        ValidateUtils.checkIntegerInRange(displayOrder, "Display order", 0, Integer.MAX_VALUE);
        description = ValidateUtils.checkLength(description, "Description", 0, Constants.DefaultValueEntity.DESCRIPTION_LENGTH);
        if(settingType.equals(Constants.SettingType.QUALITY) || settingType.equals(Constants.SettingType.COMPLEXITY)
                        || settingType.equals(Constants.SettingType.ROUND)){
            ValidateUtils.checkNullOrEmpty(subjectId, "Subject id");
            ValidateUtils.checkNullOrEmpty(extValue, settingType + " extend value");
            try{
                int extIntValue = Integer.parseInt(extValue);
                if(extIntValue <= 0)
                    throw new ApiInputException(settingType + " extend value must be > 0!");
                if(settingType.equals(Constants.SettingType.QUALITY) && extIntValue > 100){
                    throw new ApiInputException("Quality must be <= 100%!");
                }
                extValue = extIntValue + "";
            }catch (NumberFormatException ex){
                throw new ApiInputException(settingType + " extend value must be number!");
            }
        }
    }
}

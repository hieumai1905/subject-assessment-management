package com.sep490.sep490.dto;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.util.Date;
import java.util.List;

@Data
@RequiredArgsConstructor
public class SubmissionDTO {
    private Integer id;
    private String updateBy;
    private String teamName;
    private Integer teamId;
    private String mileName;
    private String submitFile;
    private String submitLink;
    private Date submitAt;
    private String status;
    private String note;
    private List<RequirementDTO> requirementDTOS;

//    public void validateInput(){
//        ValidateUtils.checkNullOrEmpty(name, "Setting name");
//        name = ValidateUtils.checkLength(name, "Setting name", 1, 255);
//        ValidateUtils.checkNullOrEmpty(settingType, "Setting type");
//        settingType = ValidateUtils.checkLength(settingType, "Setting type", 1, 255);
//        ValidateUtils.checkLength(extValue, "External value", 0, 255);
//        ValidateUtils.checkIntegerInRange(displayOrder, "Display order", 0, Integer.MAX_VALUE);
//        description = ValidateUtils.checkLength(description, "Description", 0, Constants.DefaultValueEntity.DESCRIPTION_LENGTH);
//        if(settingType.equals(Constants.SettingType.QUALITY) || settingType.equals(Constants.SettingType.COMPLEXITY)){
//            ValidateUtils.checkNullOrEmpty(subjectId, "Subject id");
//            ValidateUtils.checkNullOrEmpty(extValue, settingType + " extend value");
//            try{
//                int extIntValue = Integer.parseInt(extValue);
//                if(extIntValue <= 0)
//                    throw new ApiInputException(settingType + " extend value must be > 0!");
//                if(settingType.equals(Constants.SettingType.QUALITY) && extIntValue > 100){
//                    throw new ApiInputException("Quality must be <= 100%!");
//                }
//                extValue = extIntValue + "";
//            }catch (NumberFormatException ex){
//                throw new ApiInputException(settingType + " extend value must be number!");
//            }
//        }
//    }
}

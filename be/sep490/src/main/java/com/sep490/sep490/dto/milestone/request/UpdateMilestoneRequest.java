package com.sep490.sep490.dto.milestone.request;

import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.ValidateUtils;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.util.Date;

@Data
@RequiredArgsConstructor
public class UpdateMilestoneRequest {
    private String title;
    private Date startDate;
    private Date dueDate;
    private String note;

    public void validateInput(){
        ValidateUtils.checkNullOrEmpty(title, "Title");
        title = ValidateUtils.checkLength(title, "Title", 1, 255);
//        ValidateUtils.checkNullOrEmpty(startDate, "Start date");
        startDate = new Date();
        ValidateUtils.checkNullOrEmpty(dueDate, "Due date");
        ValidateUtils.checkBeforeCurrentDate(dueDate,"Due date");
        note = ValidateUtils.checkLength(note, "Note",
                Constants.DefaultValueEntity.MIN_LENGTH, Constants.DefaultValueEntity.DESCRIPTION_LENGTH);
    }
}

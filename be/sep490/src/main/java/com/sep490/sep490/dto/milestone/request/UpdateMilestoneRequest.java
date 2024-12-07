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
        ValidateUtils.checkNullOrEmpty(title, "Tiêu đề");
        title = ValidateUtils.checkLength(title, "Tiêu đề", 1, 255);
//        ValidateUtils.checkNullOrEmpty(startDate, "Start date");
        startDate = new Date();
        ValidateUtils.checkNullOrEmpty(dueDate, "Ngày hết hạn");
        ValidateUtils.checkBeforeCurrentDate(dueDate,"Ngày hết hạn");
        note = ValidateUtils.checkLength(note, "Ghi chú",
                Constants.DefaultValueEntity.MIN_LENGTH, Constants.DefaultValueEntity.DESCRIPTION_LENGTH);
    }
}

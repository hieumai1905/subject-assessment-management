package com.sep490.sep490.dto.milestone.request;

import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.ValidateUtils;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.util.Date;

@Data
@RequiredArgsConstructor
public class MilestoneRequest {
    private Integer assignmentId;
    private Integer classesId;
    private Date startDate;
    private Date dueDate;
    private String note;

    public void validateInput(){
//        ValidateUtils.checkNullOrEmpty(assignmentId, "Assignment");
//        ValidateUtils.checkNullOrEmpty(classId, "Class");
        ValidateUtils.checkNullOrEmpty(startDate, "Ngày bắt đầu");
        ValidateUtils.checkNullOrEmpty(dueDate, "Ngày hết hạn");
        ValidateUtils.checkValidRangeOfDate(startDate, dueDate, "Ngày bắt đầu", "Ngày kết thúc");
        note = ValidateUtils.checkLength(note, "Ghi chú",
                Constants.DefaultValueEntity.MIN_LENGTH, Constants.DefaultValueEntity.DESCRIPTION_LENGTH);
    }
}

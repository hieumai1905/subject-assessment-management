package com.sep490.sep490.dto;

import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.common.utils.ValidateUtils;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import java.util.Date;

@Data
@RequiredArgsConstructor
public class MilestoneDTO {
    private Integer id;
    private Date startDate;
    private Date dueDate;
    private String note;
    private String title;
    private Boolean active;
    private  Integer displayOrder;
    private Integer classesId;
    private Integer subjectId;
    private String classesCode;
    private Integer assignmentId;
    private Integer teacherId;
    private String assignmentTitle;
    private String typeEvaluator;

    public void validateInput(){
        ValidateUtils.checkNullOrEmpty(startDate, "Start date");
        ValidateUtils.checkNullOrEmpty(dueDate, "Due date");
        ValidateUtils.checkValidRangeOfDate(startDate, dueDate, "Start date", "Due date");
        ValidateUtils.checkNullOrEmpty(classesId, "Class");
        ValidateUtils.checkNullOrEmpty(assignmentId, "Assignment");

        note = ValidateUtils.checkLength(note, "Note",
                Constants.DefaultValueEntity.MIN_LENGTH, Constants.DefaultValueEntity.DESCRIPTION_LENGTH);
    }
}

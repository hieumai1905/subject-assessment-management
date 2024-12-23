package com.sep490.sep490.dto.studentEvaluation.request;

import com.sep490.sep490.common.utils.ValidateUtils;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class StudentEvalSearchRequest {
    private Integer classId;
    private Integer teamId;
    private Integer milestoneId;
    public void validateInput(){
        ValidateUtils.checkNullOrEmpty(classId, "Lớp học");
        ValidateUtils.checkNullOrEmpty(milestoneId, "Giai đoạn");
    }
}

package com.sep490.sep490.dto.assignment.request;

import com.sep490.sep490.common.utils.ValidateUtils;
import com.sep490.sep490.dto.AssignmentDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.RequiredArgsConstructor;

import java.util.List;
@Data
@RequiredArgsConstructor
@AllArgsConstructor
public class CreateAssignmentRequest {
    private Integer subjectId;
    private List<AssignmentRequest> assignmentList;

    public void validateInput(){
        ValidateUtils.checkNullOrEmpty(assignmentList, "Danh sách");
        ValidateUtils.checkNullOrEmpty(subjectId, "Id");
        for (AssignmentRequest assignmentRequest : assignmentList){
            assignmentRequest.validateInput();
        }
    }
}

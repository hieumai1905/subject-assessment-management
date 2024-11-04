package com.sep490.sep490.dto.requirement.request;

import com.sep490.sep490.common.exception.ApiInputException;
import com.sep490.sep490.common.utils.ValidateUtils;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
public class SubmitRequirementRequest {
//    private String submitType;
    private String link;
    private List<Integer> requirementIds;
    private List<Integer> assigneeIds;
    private String note;
    private Integer teamId;
    private Integer milestoneId;

    public void validateInput(MultipartFile file, Boolean isGrandFinal){
        ValidateUtils.checkNullOrEmpty(teamId, "Team id");
        ValidateUtils.checkNullOrEmpty(milestoneId, "Milestone id");
        ValidateUtils.checkLength(link, "Link", 0, 750);
        if(!isGrandFinal){
            ValidateUtils.checkNullOrEmpty(requirementIds, "Requirement ids");
            for (Integer requirementId : requirementIds) {
                ValidateUtils.checkNullOrEmpty(requirementId, "Requirement id");
            }
            ValidateUtils.checkNullOrEmpty(assigneeIds, "Assignee ids");
            for (Integer assigneeId : assigneeIds) {
                ValidateUtils.checkNullOrEmpty(assigneeId, "Assignee id");
            }
            if(requirementIds.size() != assigneeIds.size()) {
                throw new ApiInputException("Number of requirements must be equals to assignee!");
            }
        }
        note = ValidateUtils.checkLength(note, "Note", 0, 750);
    }
}

package com.sep490.sep490.dto;

import com.sep490.sep490.dto.user.request.CreateUserRequest;
import lombok.Data;

@Data
public class TeamRequirementDTO {
    private Integer id;
    private String submission;
    private String submitType;
    private String status;
    private Integer teamId;
    private String teamName;
    private Integer requirementId;
    private String reqTitle;
    private CreateUserRequest assignee;
}

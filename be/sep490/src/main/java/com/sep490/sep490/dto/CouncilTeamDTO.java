package com.sep490.sep490.dto;

import com.sep490.sep490.common.utils.ValidateUtils;
import lombok.Data;

import java.util.List;
@Data
public class CouncilTeamDTO {
    private Integer id;
    private Integer teamId;
    private String teamName;
    private Integer classId;
    private String classCode;
    private Integer teacherId;
    private String email;
    private String username;
    private Float avgGrade;
    private Integer size;
    private Integer councilId;
    private String councilName;
    private List<CouncilMemberDTO> councilMemberDTOs;
    private SessionDTO session;
    private String status;
    private List<CouncilTeamDTO> otherCouncilTeamDTOs;
}

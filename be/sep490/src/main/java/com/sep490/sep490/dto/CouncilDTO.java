package com.sep490.sep490.dto;

import com.sep490.sep490.common.utils.ValidateUtils;
import com.sep490.sep490.entity.CouncilMember;
import com.sep490.sep490.entity.CouncilTeam;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Data
public class CouncilDTO {
    private Integer id;
    private Integer roundNum;
    private String councilName;
    private Integer semesterId;
    private String semesterName;
    private Integer subjectSettingId;
    private String subjectSettingName;
    private List<CouncilTeamDTO> councilTeams;
    private List<CouncilMemberDTO> councilMembers;
    private Boolean canDelete;

    public void validateInput(){
        ValidateUtils.checkNullOrEmpty(semesterId, "Học kỳ");
        ValidateUtils.checkNullOrEmpty(subjectSettingId, "Lần đánh giá");
        ValidateUtils.checkNullOrEmpty(councilMembers, "Thành viên hội đồng");
    }
}

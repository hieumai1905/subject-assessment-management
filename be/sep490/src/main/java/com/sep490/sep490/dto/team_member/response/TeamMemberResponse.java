package com.sep490.sep490.dto.team_member.response;

import lombok.Data;

@Data
public class TeamMemberResponse {
    private Integer memberId;
    private String email;
    private String fullName;
    private Integer teamId;
}

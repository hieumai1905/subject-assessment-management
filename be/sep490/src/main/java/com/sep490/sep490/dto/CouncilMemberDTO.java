package com.sep490.sep490.dto;

import lombok.Data;

@Data
public class CouncilMemberDTO {
    private Integer id;
    private String fullname;
    private String gender;
    private String email;
    private String username;
    private Integer roleId;
}

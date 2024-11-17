package com.sep490.sep490.dto.user.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@AllArgsConstructor
@RequiredArgsConstructor
public class CreateUserRequest {
    private Integer id;
    private String fullname;
    private String gender;
    private String email;
    private Integer roleId;
    private String note;
}

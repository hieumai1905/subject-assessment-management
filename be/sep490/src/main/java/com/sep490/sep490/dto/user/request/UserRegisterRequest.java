package com.sep490.sep490.dto.user.request;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class UserRegisterRequest {
    private String fullname;
    private String email;
    private String password;
    private String confirmPassword;
    private Boolean active;
    private Integer roleId;
}

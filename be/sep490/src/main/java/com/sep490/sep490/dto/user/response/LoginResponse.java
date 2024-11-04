package com.sep490.sep490.dto.user.response;

import com.sep490.sep490.dto.UserDTO;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class LoginResponse {
    private Boolean hasAccount;
    private UserDTO user;
    private String token;
    private String role;
}

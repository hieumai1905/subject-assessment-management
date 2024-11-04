package com.sep490.sep490.dto.user.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
@AllArgsConstructor
public class CheckPassForgotResponse {
    private String email;
    private Boolean checkCode;
}

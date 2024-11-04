package com.sep490.sep490.dto.user.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@AllArgsConstructor
@RequiredArgsConstructor
public class SendEmailCodeRequest {
    private String email;
}

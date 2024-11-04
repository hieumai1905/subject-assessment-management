package com.sep490.sep490.dto.user.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@AllArgsConstructor
@RequiredArgsConstructor
public class LoginGoogleRequest {
    private String email;
    private String email_verified;
    private String family_name;
    private String given_name;
    private String iss;
    private String name;
    private String picture;
}

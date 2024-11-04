package com.sep490.sep490.common;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum SEP490_Error {
    INTERNAL_SERVER_ERROR   ("INTERNAL_SERVER_ERROR"), // request sai trang thai
    USER_USERNAME_PASSWORD_ERROR("USER_USERNAME_PASSWORD_ERROR"), // Username password ko hợp lệ
    USER_USERNAME_ALREADY_ERROR("USER_USERNAME_PASSWORD_ERROR"), // Username password ko hợp lệ
    USER_NOT_FOUND_ERROR("USER_NOT_FOUND_ERROR"), // call otp error
    INVALID_JSON_PARSE("INVALID_JSON_PARSE"),
    UNKNOWN_ERROR("UNKNOWN_ERROR");
    private final String message;
}

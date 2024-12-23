package com.sep490.sep490.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;


@ResponseStatus(HttpStatus.CONFLICT)
public class UnauthorizedException extends RuntimeException {

    public UnauthorizedException(String exception) {
        super(exception);
    }
}

package com.sep490.sep490.dto;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class ClassUserErrorDTO {
    String email;
    String code;
    String fullname;
    String errorDetails;
}

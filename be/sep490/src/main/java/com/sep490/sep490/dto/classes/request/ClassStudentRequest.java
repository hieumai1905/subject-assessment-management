package com.sep490.sep490.dto.classes.request;

import com.sep490.sep490.dto.user.request.CreateUserRequest;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.util.List;
@Data
@AllArgsConstructor
@RequiredArgsConstructor
public class ClassStudentRequest {
    private Integer classId;
    private CreateUserRequest createUserRequest;
}

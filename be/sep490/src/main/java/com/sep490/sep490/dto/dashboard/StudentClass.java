package com.sep490.sep490.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class StudentClass{
    private int classId;
    private String className;
    private int totalStudent;
}
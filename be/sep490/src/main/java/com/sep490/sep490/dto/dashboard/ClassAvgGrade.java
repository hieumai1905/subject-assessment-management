package com.sep490.sep490.dto.dashboard;

import lombok.Data;

@Data
public class ClassAvgGrade {
    private String classCode;
    private String email;
    private Double grade;

    public ClassAvgGrade(String classCode, String email, Double grade) {
        this.classCode = classCode;
        this.email = email;
        this.grade = grade;
    }
}

package com.sep490.sep490.dto.dashboard;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class GradeDistribution {
    private String grade;
    private Long numberOfGrades;
    private Double avgGrade;

    public GradeDistribution(String grade, Long numberOfGrades) {
        this.grade = grade;
        this.numberOfGrades = numberOfGrades;
    }

    public GradeDistribution(String iter, Double avgGrade) {
        this.grade = iter;
        this.avgGrade = avgGrade;
    }
}

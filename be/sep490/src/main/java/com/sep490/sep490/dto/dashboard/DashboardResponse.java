package com.sep490.sep490.dto.dashboard;

import lombok.Data;

import java.util.List;

@Data
public class DashboardResponse {
    private List<GradeDistribution> gradeDistributionList;
    private List<OngoingPassFail> ongoingPassFailList;
    private List<AvgRequirements> avgRequirementsList;
    private List<GradeDistribution> avgGradeList;
    private List<TopLOCGrade> topLOCGradeList;
    private List<ClassAvgGrade> classAvgGradeList;
}

package com.sep490.sep490.dto.evaluation.response;

import lombok.Data;

import java.util.List;

@Data
public class FinalEvaluationResult {
    private Integer id;
    private Integer councilTeamId;
    private Integer classId;
    private Integer milestoneId;
    private String classCode;
    private Integer studentId;
    private String fullname;
    private String email;
    private String username;
    private Integer sessionId;
    private String sessionName;
    private Integer teamId;
    private String teamName;
    private String status;
    private Float avgGrade;
    private List<GradeEvaluator> gradeEvaluators;
}

package com.sep490.sep490.dto.evaluation.response;

import lombok.Data;

@Data
public class GradeEvaluator {
    private Integer id;
    private String fullname;
    private String username;
    private String email;
    private Float grade;
    private Integer complexityId;
    private String complexityName;
    private Integer qualityId;
    private String qualityName;
    private String comment;
}

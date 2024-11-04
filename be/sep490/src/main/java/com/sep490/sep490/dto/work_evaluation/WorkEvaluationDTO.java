package com.sep490.sep490.dto.work_evaluation;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WorkEvaluationDTO{
    private Integer complexityId;
    private Integer qualityId;
    private Float grade;
    private String comment;
}

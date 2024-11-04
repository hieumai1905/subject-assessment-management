package com.sep490.sep490.dto;

import com.sep490.sep490.entity.MilestoneCriteria;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvaluationResultDTO {
    private Integer id;
    private String fullname;
    private String email;
    private Float totalLoc;
    private BaseEvaluationDTO team;
    private BaseEvaluationDTO milestone;
    private BaseEvaluationDTO[] milestones;
    private Float evalGrade;
    private String comment;
    private BaseEvaluationDTO[] criteriaNames;
    private Float[] evalGrades;
    private String[] comments;

    public EvaluationResultDTO(Float evalGrade, String comment){
        this.evalGrade = evalGrade;
        this.comment = comment;
    }
}


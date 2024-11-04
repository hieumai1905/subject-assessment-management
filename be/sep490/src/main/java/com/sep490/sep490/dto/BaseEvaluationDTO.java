package com.sep490.sep490.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BaseEvaluationDTO {
    private Integer id;
    private String name;
    private Integer weight;
    private Integer expectedLoc;
    private Integer displayOrder;
    private Boolean locEvaluation;
    private String typeEvaluator;
    private Float grade;
    private String comment;

    public BaseEvaluationDTO(Integer id, String name) {
        this.id = id;
        this.name = name;
    }
}

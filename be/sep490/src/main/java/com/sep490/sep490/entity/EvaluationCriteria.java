package com.sep490.sep490.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sep490.sep490.common.utils.Constants;
import jakarta.persistence.*;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "evaluation_criteria")
@EqualsAndHashCode(callSuper = true)
public class EvaluationCriteria extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(name = "criteria_name")
    private String criteriaName;
    @Column(name = "eval_weight")
    private Integer evalWeight;
    @Column(name = "loc_evaluation")
    private Boolean locEvaluation;
    @Column(name = "guides", length = Constants.DefaultValueEntity.DESCRIPTION_LENGTH)
    private String guides;

    @ManyToOne
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @JsonIgnoreProperties(value = {"manageSubjects"})
    @JoinColumn(name = "assignment_id")
    private Assignment assignment;

}

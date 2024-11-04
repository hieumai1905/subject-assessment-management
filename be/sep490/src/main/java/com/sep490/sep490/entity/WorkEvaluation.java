package com.sep490.sep490.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sep490.sep490.common.utils.Constants;
import jakarta.persistence.*;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "work_evaluation")
@EqualsAndHashCode(callSuper = true)
public class WorkEvaluation extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(name = "comment", length = Constants.DefaultValueEntity.DESCRIPTION_LENGTH)
    private String comment;
    @Column(name = "grade")
    private Float grade;

//    @Column(name = "is_update_eval")
//    private Boolean isUpdateEval;
    @Column(name = "council_team_id")
    private Integer councilTeamId;

    @ManyToOne
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @JsonIgnoreProperties(value = {"manageSubjects"})
    @JoinColumn(name = "milestone_id")
    private Milestone milestone;

    @ManyToOne
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @JoinColumn(name = "requirement_id")
    private Requirement requirement;

    @ManyToOne
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @JoinColumn(name = "student_id")
    private User student;

    @ManyToOne
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @JoinColumn(name = "evaluator_id")
    private User evaluator;

    @ManyToOne
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @JoinColumn(name = "quality_id")
    private Setting quality;

    @ManyToOne
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @JoinColumn(name = "complexity_id")
    private Setting complexity;
}

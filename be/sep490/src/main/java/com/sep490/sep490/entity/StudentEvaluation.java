package com.sep490.sep490.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sep490.sep490.common.utils.Constants;
import jakarta.persistence.*;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "student_evaluation")
@EqualsAndHashCode(callSuper = true)
public class StudentEvaluation extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @ManyToOne
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @JoinColumn(name = "milestone_id")
    private Milestone milestone;
    @ManyToOne
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @JoinColumn(name = "criteria_id")
    private MilestoneCriteria criteria;
    @Column(name = "eval_grade")
    private Float evalGrade;
    @Column(name = "total_loc")
    private Float totalLOC;
    @Column(name = "council_team_id")
    private Integer councilTeamId;
    @Column(name = "comment", length = Constants.DefaultValueEntity.DESCRIPTION_LENGTH)
    private String comment;
    @Column(name = "status")
    private String status;

    @ManyToOne
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @JoinColumn(name = "evaluator_id")
    private User evaluator;

}

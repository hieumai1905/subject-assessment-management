package com.sep490.sep490.entity;

import com.sep490.sep490.common.utils.Constants;
import jakarta.persistence.*;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "team_evaluation")
@EqualsAndHashCode(callSuper = true)
public class TeamEvaluation extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @ManyToOne
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @JoinColumn(name = "team_id")
    private Team team;
    @ManyToOne
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @JoinColumn(name = "milestone_id")
    private Milestone milestone;
    @ManyToOne
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @JoinColumn(name = "evaluator_id")
    private User evaluator;
    @ManyToOne
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @JoinColumn(name = "criteria_id")
    private MilestoneCriteria criteria;
    @Column(name = "eval_grade")
    private Float evalGrade;
    @Column(name = "comment", length = Constants.DefaultValueEntity.DESCRIPTION_LENGTH)
    private String comment;
    @Column(name = "council_team_id")
    private Integer councilTeamId;
}

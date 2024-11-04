package com.sep490.sep490.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.util.Date;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "milestone_criteria")
@EqualsAndHashCode(callSuper = true)
public class MilestoneCriteria extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @ManyToOne
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @JsonIgnoreProperties(value = {"milestone"})
    @JoinColumn(name = "milestone_id")
    private Milestone milestone;
//    @ManyToOne
//    @EqualsAndHashCode.Exclude
//    @ToString.Exclude
//    @JoinColumn(name = "parent_criteria_id")
//    private MilestoneCriteria parentCriteria;
    @Column(name = "criteria_name")
    private String criteriaName;
    @Column(name = "eval_weight")
    private Integer evalWeight;
    @Column(name = "loc_evaluation")
    private Boolean locEvaluation;
    @Column(name = "note")
    private String note;
    @OneToMany(mappedBy = "criteria", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<StudentEvaluation> studentEvaluations;
    @OneToMany(mappedBy = "criteria", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<TeamEvaluation> teamEvaluations;
//    @OneToMany(mappedBy = "parentCriteria", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
//    private List<MilestoneCriteria> subCriteria;
}

package com.sep490.sep490.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sep490.sep490.common.utils.Constants;
import jakarta.persistence.*;
import lombok.*;

import java.util.Date;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "milestone")
@EqualsAndHashCode(callSuper = true)
public class Milestone extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(name = "title")
    private String title;
    @Column(name = "start_date")
    private Date startDate;
    @Column(name = "due_date")
    private Date dueDate;
    @Column(name = "note", length = Constants.DefaultValueEntity.DESCRIPTION_LENGTH)
    private String note;
    @Column(name = "display_order")
    private Integer displayOrder;
    @Column(name = "expected_loc")
    private Integer expectedLoc;
    @Column(name = "eval_weight")
    private Integer evalWeight;
    @Column(name = "type_evaluator")
    private String typeEvaluator;

    @ManyToOne
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @JsonIgnoreProperties(value = {"manageSubjects"})
    @JoinColumn(name = "class_id")
    private Classes classes;

//    @ManyToOne
//    @EqualsAndHashCode.Exclude
//    @ToString.Exclude
//    @JsonIgnoreProperties(value = {"manageSubjects"})
//    @JoinColumn(name = "assignment_id")
//    private Assignment assignment;

    @OneToMany(mappedBy = "milestone", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<Team> teams;

    @OneToMany(mappedBy = "milestone", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<StudentEvaluation> studentEvaluations;

    @OneToMany(mappedBy = "milestone", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<TeamEvaluation> teamEvaluations;

    @OneToMany(mappedBy = "milestone", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<WorkEvaluation> workEvaluations;

    @OneToMany(mappedBy = "milestone", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<Requirement> requirements;
    @OneToMany(mappedBy = "milestone", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<MilestoneCriteria> milestoneCriteriaList;
    // neu loi submission thi xoa di nha
//    @OneToMany(mappedBy = "milestone", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
//    private List<Submission> submissions;
}

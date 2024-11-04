package com.sep490.sep490.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sep490.sep490.common.utils.Constants;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "requirement")
@EqualsAndHashCode(callSuper = true)
public class Requirement extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(name = "req_title")
    private String reqTitle;
    @Column(name = "note", length = Constants.DefaultValueEntity.DESCRIPTION_LENGTH)
    private String note;
    @Column(name = "submission", length = Constants.DefaultValueEntity.DESCRIPTION_LENGTH)
    private String submission;
    @Column(name = "status")
    private String status;
    @Column(name = "submit_type")
    private String submitType;
    @Column(name = "submissionId")
    private Integer submissionId;

    @ManyToOne
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @JoinColumn(name = "student_id")
    private User student;

    @ManyToOne
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @JoinColumn(name = "complexity_id")
    private Setting complexity;

    @ManyToOne
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @JsonIgnoreProperties(value = {"manageSubjects"})
    @JoinColumn(name = "milestone_id")
    private Milestone milestone;

    @ManyToOne
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @JoinColumn(name = "team_id")
    private Team team;

    @OneToMany(mappedBy = "requirement", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<WorkEvaluation> workEvaluations;

    @OneToMany(mappedBy = "requirement", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<UpdateTracking> updateTrackings;
}

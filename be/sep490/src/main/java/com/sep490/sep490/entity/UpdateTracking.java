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
@Table(name = "update_tracking")
@EqualsAndHashCode(callSuper = true)
public class UpdateTracking extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(name = "note", length = Constants.DefaultValueEntity.DESCRIPTION_LENGTH)
    private String note;
//    @Column(name = "submission", length = Constants.DefaultValueEntity.DESCRIPTION_LENGTH)
//    private String submission;
//    @Column(name = "submit_type")
//    private String submitType;

    // Milestone id
//    @ManyToOne
//    @EqualsAndHashCode.Exclude
//    @ToString.Exclude
//    @JsonIgnoreProperties(value = {"manageSubjects"})
//    @JoinColumn(name = "milestone_id")
//    private Milestone milestone;

    @ManyToOne
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @JsonIgnoreProperties(value = {"manageSubjects"})
    @JoinColumn(name = "student_id")
    private User student;

    @ManyToOne
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @JsonIgnoreProperties(value = {"manageSubjects"})
    @JoinColumn(name = "requirement_id")
    private Requirement requirement;
}

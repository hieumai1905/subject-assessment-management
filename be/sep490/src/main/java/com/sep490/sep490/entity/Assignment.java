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
@Table(name = "assignment")
@EqualsAndHashCode(callSuper = true)
@Builder
public class Assignment extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(name = "assignment_title")
    private String assignmentTitle;
    @Column(name = "expected_loc")
    private Integer expectedLoc;
    @Column(name = "eval_weight")
    private Integer evalWeight;
    @Column(name = "note", length = Constants.DefaultValueEntity.DESCRIPTION_LENGTH)
    private String note;
    @Column(name = "display_order")
    private Integer displayOrder;
    @Column(name = "evaluation_type")
    private String evaluationType;

    @ManyToOne
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @JsonIgnoreProperties(value = {"manageSubjects"})
    @JoinColumn(name = "subject_id")
    private Subject subject;

    @OneToMany(mappedBy = "assignment", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<EvaluationCriteria> evaluationCriterias;

}

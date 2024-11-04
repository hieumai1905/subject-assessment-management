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
@Table(name = "class_user")
@EqualsAndHashCode(callSuper = true)
public class ClassUser extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @ManyToOne
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @JoinColumn(name = "class_id")
    private Classes classes;
    @ManyToOne
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @JoinColumn(name = "user_id")
    private User user;
    @Column(name = "note", length = Constants.DefaultValueEntity.DESCRIPTION_LENGTH)
    private String note;

//    @OneToMany(mappedBy = "classUser", cascade = CascadeType.ALL)
//    private List<StudentEvaluation> studentEvaluations;

//    @OneToMany(mappedBy = "assignee", cascade = CascadeType.ALL)
//    private List<TeamRequirement> teamRequirements;

}

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
@Table(name = "setting")
@EqualsAndHashCode(callSuper = true)
public class Setting extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(name = "name")
    private String name;
    @Column(name = "ext_value")
    private String extValue;
    @Column(name = "setting_type")
    private String settingType;
    @Column(name = "display_order")
    private Integer displayOrder;
    @Column(name = "description", length = Constants.DefaultValueEntity.DESCRIPTION_LENGTH)
    private String description;

    @OneToMany(mappedBy = "role", cascade = CascadeType.ALL,fetch = FetchType.EAGER)
    private List<User> users;

    @OneToMany(mappedBy = "semester", cascade = CascadeType.ALL)
    private List<Classes> classes;
    @OneToMany(mappedBy = "quality", cascade = CascadeType.ALL)
    private List<WorkEvaluation> quantities;

    @OneToMany(mappedBy = "complexity", cascade = CascadeType.ALL)
    private List<WorkEvaluation> complexities;

    @OneToMany(mappedBy = "complexity", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<Requirement> requirement;

    @ManyToOne
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @JsonIgnoreProperties(value = {"manageSubjects"})
    @JoinColumn(name = "subject_id")
    private Subject subject;
}

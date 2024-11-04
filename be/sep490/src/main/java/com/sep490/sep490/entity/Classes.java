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
@Table(name = "classes")
@EqualsAndHashCode(callSuper = true)
@Builder
public class Classes extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(name = "class_code")
    private String classCode;
    @Column(name = "name")
    private String name;
    @Column(name = "description", length = Constants.DefaultValueEntity.DESCRIPTION_LENGTH)
    private String description;

//    @OneToMany(mappedBy = "role", cascade = CascadeType.ALL)
//    private List<User> users;

    @ManyToOne
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @JsonIgnoreProperties(value = {"users"})
    @JoinColumn(name = "semester_id")
    private Setting semester;

    @ManyToOne
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @JsonIgnoreProperties(value = {"users"})
    @JoinColumn(name = "teacher_id")
    private User teacher;

    @ManyToOne
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @JsonIgnoreProperties(value = {"users"})
    @JoinColumn(name = "subject_id")
    private Subject subject;

    @OneToMany(mappedBy = "classes", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<Milestone> milestones;

    @OneToMany(mappedBy = "classes", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<Team> teams;

    @OneToMany(mappedBy = "classes", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<ClassUser> classesUsers;
}

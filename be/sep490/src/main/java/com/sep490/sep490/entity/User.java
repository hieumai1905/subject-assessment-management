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
@Table(name = "users")
@EqualsAndHashCode(callSuper = true)
@Builder
public class User extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(name = "username")
    private String username;
    @Column(name = "code")
    private String code;
    @Column(name = "fullname")
    private String fullname;
    @Column(name = "gender")
    private String gender;
    @Column(name = "email")
    private String email;
    @Column(name = "mobile")
    private String mobile;
    @Column(name = "password")
    private String password;
    @Column(name = "avatar_url")
    private String avatar_url;
    @Column(name = "note", length = Constants.DefaultValueEntity.DESCRIPTION_LENGTH)
    private String note;
    @Column(name = "status")
    private String status;

    @ManyToOne
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @JsonIgnoreProperties(value = {"users"})
    @JoinColumn(name = "role_id")
    private Setting role;

    @ManyToMany(mappedBy = "teachers", cascade = CascadeType.REMOVE)
    private List<Subject> subjects;

    @ManyToMany(mappedBy = "managers")
    private List<Subject> managers;

    @OneToMany(mappedBy = "teacher", cascade = CascadeType.ALL)
    private List<Classes> classes;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
    private List<UpdateTracking> updateTrackings;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<StudentEvaluation> studentEvaluations;
    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CouncilMember> councilMembers;
}

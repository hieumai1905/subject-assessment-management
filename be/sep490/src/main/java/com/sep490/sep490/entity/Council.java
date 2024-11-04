package com.sep490.sep490.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "council")
@EqualsAndHashCode(callSuper = true)
@Builder
public class Council extends BaseEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(name = "round_num")
    private Integer roundNum;
    @Column(name = "semester_id")
    private Integer semesterId;
    @Column(name = "subject_setting_id")
    private Integer subjectSettingId;
    @OneToMany(mappedBy = "council", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<CouncilTeam> councilTeams;
    @OneToMany(mappedBy = "council", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<CouncilMember> councilMembers;

}

package com.sep490.sep490.entity;

import com.sep490.sep490.common.utils.Constants;
import jakarta.persistence.*;
import lombok.*;

import java.util.Date;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "session")
@EqualsAndHashCode(callSuper = true)
@Builder
public class Session extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(name = "round_num")
    private Integer roundNum;
    @Column(name = "semester_id")
    private Integer semesterId;
    @Column(name = "subject_setting_id")
    private Integer subjectSettingId;
    @Column(name = "name", length = Constants.DefaultValueEntity.DESCRIPTION_LENGTH)
    private String name;
    @Column(name="date")
    private Date sessionDate;
    @Column(name="time")
    private Boolean time; //true la AM, false la PM
    @Column(name="note", length = Constants.DefaultValueEntity.DESCRIPTION_LENGTH)
    private String note;
    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<CouncilTeam> councilTeams;
}

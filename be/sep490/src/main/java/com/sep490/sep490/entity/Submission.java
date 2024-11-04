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
@Table(name = "submission")
@EqualsAndHashCode(callSuper = true)
@Builder
public class Submission extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(name = "milestoneId")
    private Integer milestoneId;
    @Column(name = "teamId")
    private Integer teamId;
//    @ManyToOne
//    @JoinColumn(name = "milestoneId", referencedColumnName = "id")
//    private Milestone milestone;
//    @ManyToOne
//    @JoinColumn(name = "teamId", referencedColumnName = "id")
//    private Team team;
    @Column(name = "submit_file", length = 850)
    private String submitFile;
    @Column(name = "submit_link", length = Constants.DefaultValueEntity.DESCRIPTION_LENGTH)
    private String submitLink;
    @Column(name = "status")
    private String status;
    @Column(name = "note", length = Constants.DefaultValueEntity.DESCRIPTION_LENGTH)
    private String note;

}

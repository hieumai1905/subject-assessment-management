package com.sep490.sep490.entity;

import jakarta.persistence.*;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "council_team")
@EqualsAndHashCode(callSuper = true)
@Builder
public class CouncilTeam extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "team_id")
    private Integer teamId;
    @Column(name = "class_id")
    private Integer classId;
    @Column(name = "status")
    private String status;
//    @ManyToOne
//    @JoinColumn(name = "team_id", referencedColumnName = "id")
//    private Team team;
    @ManyToOne
    @JoinColumn(name = "council_id", referencedColumnName = "id")
    private Council council;
    @ManyToOne
    @JoinColumn(name = "session_id", referencedColumnName = "id")
    private Session session;
}

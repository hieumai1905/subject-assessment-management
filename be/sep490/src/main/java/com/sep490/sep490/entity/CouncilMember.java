package com.sep490.sep490.entity;

import jakarta.persistence.*;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "council_member")
@EqualsAndHashCode(callSuper = true)
@Builder
public class CouncilMember extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @ManyToOne
    @JoinColumn(name = "member_id", referencedColumnName = "id")
    private User member;
    @ManyToOne
    @JoinColumn(name = "council_id", referencedColumnName = "id")
    private Council council;
}

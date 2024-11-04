package com.sep490.sep490.repository;

import com.sep490.sep490.entity.TeamMember;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface TeamMemberRepository extends  BaseRepository<TeamMember, Integer>{
    @Modifying
    @Query("delete from TeamMember tm where tm.team.id = :id")
    void deleteByTeamId(Integer id);

    @Query("select tm from TeamMember tm where tm.team.id = :teamId and tm.member.id = :memberId")
    TeamMember findByTeamIdAndMemberId(Integer teamId, Integer memberId);
    @Modifying
    @Query("delete from TeamMember tm where tm.team.id = :teamId and tm.member.id = :memberId")
    void deleteByTeamIdAndMemberId(Integer teamId, Integer memberId);

}

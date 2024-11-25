package com.sep490.sep490.repository;

import com.sep490.sep490.entity.Classes;
import com.sep490.sep490.entity.Team;
import com.sep490.sep490.entity.User;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface TeamRepository extends BaseRepository<Team, Integer>{
    @Query("select t from Team t where t.classes.id = :classId " +
            "and (:teamName is null or t.teamName like %:teamName%) " +
            "and (:topicName is null or t.topicName like %:topicName%)")
    List<Team> search(Integer classId, String teamName, String topicName);

    @Modifying
    @Query("delete from Team t where t.milestone.id = :milestoneId")
    void deleteByMilestoneId(Integer milestoneId);

    @Query("select t from Team t where lower(t.teamName) = lower(:teamName) and t.milestone.id = :milestoneId")
    Team findByTeamName(String teamName, Integer milestoneId);

    @Query("select t from Team t where lower(t.teamName) = lower(:teamName) " +
            "and t.classes.id = :classId and t.id <> :id")
    Team findByTeamNameAndOtherId(String teamName, Integer id, Integer classId);
    @Modifying
    @Query("delete from Team t where t.id = :id")
    void deleteByTeamId(Integer id);
    @Query("select t from Team t where t.milestone.id = :milestoneId")
    List<Team> findByMilestoneId(Integer milestoneId);
    List<Team> findAllByClasses(Classes classes);
    @Query("select t from Team t join TeamMember tm on t.id = tm.team.id where tm.member.id = :memberId")
    Team findByMemberId(@Param("memberId") Integer memberId);

    Team findByLeader(User leader);
    @Query("select distinct t from Team t where t.leader is not null and t.leader.id = :id and t.id = :teamId ")
    Team findByLeaderAndTeamId(Integer id, Integer teamId);
    @Query("select t from Team t where t.id in (:ids)")
    List<Team> findByIds(List<Integer> ids);
    @Modifying
    @Query("delete from Team t where t.classes.id = :id")
    void deleteByClassId(Integer id);
}

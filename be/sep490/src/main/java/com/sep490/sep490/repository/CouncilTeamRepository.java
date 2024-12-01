package com.sep490.sep490.repository;

import com.sep490.sep490.entity.Classes;
import com.sep490.sep490.entity.Council;
import com.sep490.sep490.entity.CouncilTeam;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CouncilTeamRepository extends BaseRepository<CouncilTeam, Integer>{
    @Query("select count(ct) > 0 from CouncilTeam ct where ct.session.id = :id")
    Boolean isExistedBySessionId(Integer id);

    @Query("select count(ct) > 0 from CouncilTeam ct where ct.council.id = :id")
    Boolean isExistedByCouncilId(Integer id);
    @Query("select ct from CouncilTeam ct where ct.classId = :id and ct.teamId is null ")
    CouncilTeam findByClassId(Integer id);
    @Query("select ct from CouncilTeam ct where ct.teamId = :id ")
    List<CouncilTeam> findByTeamId(Integer id);
    @Query("select ct from CouncilTeam ct where ct.teamId = :id " +
            "and (ct.status = :status or (ct.status = '' and :status is null))")
    CouncilTeam findByTeamId(Integer id, String status);
    @Query("select distinct ct from CouncilTeam ct " +
            "where (ct.council.id in (:councilIds) or ct.session.id in (:sessionIds)) " +
            "and ((:isSearchClass = true and ct.teamId is null and ct.classId in (:classIds)) " +
            "   or (:isSearchClass = false and ct.teamId is not null and ct.teamId in (:teamIds))) ")
    List<CouncilTeam> search(List<Integer> councilIds, List<Integer> sessionIds,
                             List<Integer> classIds, List<Integer> teamIds,
                             Boolean isSearchClass);
    @Query("select ct from CouncilTeam ct where ct.teamId = :teamId and ct.session.id = :sessionId " +
            "and ct.council is not null ")
    CouncilTeam findByTeamIdAndSessionId(Integer teamId, Integer sessionId);
    @Query("select ct from CouncilTeam ct where ct.classId <> :classId and ct.teamId is null " +
            "and ((:sessionId is null and ct.session is null) or ct.session.id = :sessionId) " +
            "and ((:councilId is null and ct.council is null) or ct.council.id = :councilId)")
    List<CouncilTeam> getNumberOfCouncilTeams(Integer sessionId, Integer councilId, Integer classId);
    @Query("select ct from CouncilTeam ct where ct.teamId is not null and ct.teamId <> :teamId " +
            "and ((:sessionId is null and ct.session is null) or ct.session.id = :sessionId) " +
            "and ((:councilId is null and ct.council is null) or ct.council.id = :councilId)")
    List<CouncilTeam> findInOtherTeam(Integer teamId, Integer councilId, Integer sessionId);

    @Query("select ct from CouncilTeam ct where ct.teamId is not null and ct.teamId = :teamId " +
            "and (ct.session is null or ct.session.id in (:sessionIds)) " +
            "and (ct.council is null or ct.council.id in (:councilIds))")
    CouncilTeam findByTeam(Integer teamId, List<Integer> councilIds, List<Integer> sessionIds);
    @Query("select ct from CouncilTeam ct where ct.classId = :classId and ct.teamId is null " +
            "   and (ct.council.id in (:councilIds) or ct.session.id in (:sessionIds))")
    CouncilTeam findByClassIdAndCouncilAndSession(Integer classId, List<Integer> councilIds, List<Integer> sessionIds);
    @Query("select ct from CouncilTeam ct where ct.teamId is not null and ct.teamId = :teamId " +
            "    and (ct.council.id in (:councilIds) or ct.session.id in (:sessionIds))")
    CouncilTeam findByTeamIdSessionIdAndCouncilId(Integer teamId, List<Integer> sessionIds, List<Integer> councilIds);

    @Query("select ct from CouncilTeam ct where ct.teamId is not null and ct.teamId = :teamId " +
            "and (ct.session is not null and ct.session.id not in (:sessionIds)) " +
            "and (ct.council is not null and ct.council.id not in (:councilIds))")
    List<CouncilTeam> findInOtherSessionsOrCouncils(Integer teamId, List<Integer> sessionIds, List<Integer> councilIds);
    @Query("select ct from CouncilTeam ct " +
            "where ct.session.id in (:sessionIds) " +
            "and ct.teamId is not null " +
            "and ct.classId = :classId " +
            "and ((:isStudent is false and :isTeacher is false) or (:isStudent is true and ct.teamId in ( " +
            "   select tm.team.id from TeamMember tm where tm.member.id = :userId )) " +
            "     or (:isTeacher is true and ct.council.id in (select cm.council.id " +
            "                          from CouncilMember cm " +
            "                          where cm.member.id = :userId))) ")
    List<CouncilTeam> findBySessionAndCouncilsAndClasses(List<Integer> sessionIds, Integer classId, Integer userId,
                                                         Boolean isTeacher, Boolean isStudent);
    @Query("select ct from CouncilTeam ct where ct.teamId is not null and ct.teamId = :teamId " +
            "and ct.session.id in (:sessionIds)")
    CouncilTeam findByTeamIdAndSessionIds(Integer teamId, List<Integer> sessionIds);
    @Query("select distinct c from CouncilTeam ct left join Classes c on ct.classId = c.id " +
            "where (ct.session.id in (:sessionIds) or ct.council.id in (:councilIds)) and ct.teamId is not null " +
            "and (:sessionId is null or ct.session.id = :sessionId) " +
            "and ((:isStudent is false and :isTeacher is false) or (:isStudent is true and ct.teamId in (" +
            "       select tm.team.id from TeamMember tm where tm.member.id = :userId )) " +
            "   or (:isTeacher is true and ct.council is not null and ct.council.id in " +
            "       (select cm.council.id from CouncilMember cm where cm.member.id = :userId)))"
    )
    List<Classes> findSessionsAndCouncils(List<Integer> councilIds, List<Integer> sessionIds, Integer sessionId,
                                          Boolean isStudent, Boolean isTeacher, Integer userId);
    @Modifying
    @Query("update CouncilTeam ct set ct.status = :status where ct.id = :councilTeamId and (ct.status is null or ct.status <> 'Reject') ")
    void updateStatusById(@Param("councilTeamId") Integer councilTeamId, @Param("status") String status);
    @Query("select ct from CouncilTeam ct where ct.teamId is null and ct.classId <> :classId " +
            "and (ct.session.id = :sessionId) " +
            "and (ct.council.id = :councilId)")
    List<CouncilTeam> findInOtherClas(Integer classId, Integer councilId, Integer sessionId);
}

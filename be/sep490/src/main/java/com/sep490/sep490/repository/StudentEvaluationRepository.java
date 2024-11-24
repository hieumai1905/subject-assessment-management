package com.sep490.sep490.repository;

import com.sep490.sep490.entity.StudentEvaluation;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;


public interface StudentEvaluationRepository extends BaseRepository<StudentEvaluation, Integer>{
    @Query("SELECT se FROM StudentEvaluation se WHERE se.user.id = :classUserId")
    List<StudentEvaluation> findAllByClassUserId(@Param("classUserId") Integer classUserId);
    @Modifying
    @Query("DELETE FROM StudentEvaluation se WHERE se.user.id = :classUserId")
    void deleteByClassUserId(@Param("classUserId") Integer classUserId);
    @Query("select se from StudentEvaluation se where se.milestone.id = :milestoneId " +
            "and ((:criteriaId is null and se.criteria is null) or se.criteria.id = :criteriaId )" +
            "and se.user.id = :userId and se.evaluator is null " +
//            "and ((:evaluatorId is null and se.evaluator is null) or se.evaluator.id = :evaluatorId ) " +
//            "and ((:councilTeamId is null and se.councilTeamId is null) or se.councilTeamId = :councilTeamId)" +
            "")
    Optional<StudentEvaluation> findStudentEvaluation(Integer milestoneId, Integer criteriaId, Integer userId);

    @Modifying
    @Query("DELETE FROM StudentEvaluation se WHERE se.user.id = :memberId and se.milestone.classes.id = :classId")
    void deleteByClassIdAndMemberId(Integer classId, Integer memberId);
    @Query("select se from StudentEvaluation se where se.milestone.id = :milestoneId " +
            "and ((:criteriaId is null and se.criteria is null) or se.criteria.id = :criteriaId )" +
            "and se.user.id = :userId and se.evaluator is not null " +
            "and ( se.evaluator.id = :evaluatorId ) " +
            "and ( se.councilTeamId = :councilTeamId)" +
            "")
    Optional<StudentEvaluation> findStudentEvaluationInGrandFinal(Integer milestoneId, Integer criteriaId, Integer userId,
                                                                  Integer evaluatorId, Integer councilTeamId);
    @Query("select se from StudentEvaluation se where se.user.id = :studentId " +
            "and se.milestone.id = :milestoneId and se.criteria is null " +
            " and se.councilTeamId is not null and se.councilTeamId = :councilTeamId ")
    List<StudentEvaluation> findByStudentIdAndCouncilTeam(Integer studentId, Integer milestoneId, Integer councilTeamId);

    @Query("select se from StudentEvaluation se where se.user.id = :studentId " +
            "and se.milestone.id = :milestoneId and se.evaluator is null " +
            " and se.councilTeamId is not null and se.councilTeamId = :councilTeamId ")
    List<StudentEvaluation> findByStudentIdAndCouncilTeamWithoutEvaluator(Integer studentId, Integer milestoneId, Integer councilTeamId);

    @Query("select se from StudentEvaluation se where se.councilTeamId = :councilTeamId and se.user.id = :userId " +
            "and (se.evaluator is null or se.evaluator.id <> :evaluatorId) and ((:criteriaId is null and se.criteria is null) " +
            "   or se.criteria.id = :criteriaId)")
    List<StudentEvaluation> findEvalByCouncilTeam(Integer userId, Integer councilTeamId, Integer evaluatorId, Integer criteriaId);
    @Query("select distinct se.user.id from StudentEvaluation se where se.councilTeamId is not null and se.councilTeamId = :councilTeamId " +
            "and se.criteria is null and se.milestone.id = :milestoneId and se.evaluator is null " +
            "and se.status = 'Reject' and se.user.id in (:studentIds) ")
    List<Integer> getMembersRejectedOrEmptyStatus(Integer councilTeamId, Integer milestoneId, List<Integer> studentIds);
    @Query("select se from StudentEvaluation se where se.user.id = :studentId " +
            "and se.criteria is not null and se.criteria.id = :criteriaId and se.evaluator is null " +
            " and se.councilTeamId is not null and se.councilTeamId = :councilTeamId ")
    StudentEvaluation findCriteriaEval(Integer studentId, Integer criteriaId, Integer councilTeamId);
}

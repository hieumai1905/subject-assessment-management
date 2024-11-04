package com.sep490.sep490.repository;

import com.sep490.sep490.entity.WorkEvaluation;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface WorkEvaluationRepository extends BaseRepository<WorkEvaluation, Integer>{
    @Query("select we from WorkEvaluation we where we.requirement.id = :reqId and we.milestone.id = :milestoneId " +
            "and we.evaluator is null ")
    WorkEvaluation findByReqIdAndIsUpdateEval(Integer reqId, Integer milestoneId);

    @Modifying
    @Query("delete from WorkEvaluation we where we.requirement.id in (:ids)")
    void deleteByReqIds(List<Integer> ids);

    @Modifying
    @Query("delete from WorkEvaluation we where we.requirement.id " +
            "in (select r.id from Requirement r where r.team.id = :teamId and r.student.id = :memberId)")
    void deleteByTeamIdAndMemberId(Integer teamId, Integer memberId);
    @Query("select we from WorkEvaluation we where we.requirement.id = :reqId " +
            "and we.evaluator is not null and we.evaluator.id = :evaluatorId " +
            "and we.councilTeamId is not null and we.councilTeamId = :councilTeamId ")
    WorkEvaluation findByEvaluatorIdAndCouncilTeamId(Integer reqId, Integer evaluatorId, Integer councilTeamId);
    @Query("select sum(we.grade) from WorkEvaluation we " +
            "where we.student.id = :userId and we.milestone.id = :mileId ")
    Float getTotalByUserIdAndMileId(Integer userId, Integer mileId);
    @Query("select sum(we.grade) from WorkEvaluation we " +
            "where we.student.id = :userId and we.milestone.id = :mileId " +
            "and we.councilTeamId = :councilTeamId and we.evaluator is not null and we.evaluator.id = :evaluatorId")
    Float getTotalByUserIdAndMileIdInGrandFinal(Integer userId, Integer mileId, Integer councilTeamId, Integer evaluatorId);
    @Query("select we from WorkEvaluation we where we.requirement.id in (:reqIds) and we.milestone.id = :milestoneId " +
            "and we.councilTeamId is not null and we.councilTeamId = :councilTeamId and we.evaluator is not null " +
            "and we.evaluator.id in (:evaluatorIds) ")
    List<WorkEvaluation> findByCouncilTeamAndUserId(List<Integer> reqIds, List<Integer> evaluatorIds, Integer milestoneId,
                                                    Integer councilTeamId);
}

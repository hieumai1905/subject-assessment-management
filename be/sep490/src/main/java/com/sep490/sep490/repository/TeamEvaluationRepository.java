package com.sep490.sep490.repository;


import com.sep490.sep490.entity.Milestone;
import com.sep490.sep490.entity.Team;
import com.sep490.sep490.entity.TeamEvaluation;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface TeamEvaluationRepository extends BaseRepository<TeamEvaluation, Integer>{
    @Query("select te from TeamEvaluation te where te.milestone.id = :milestoneId " +
            "and te.team.id = :teamId " +
            "and ((:criteriaId is null and te.criteria is null) or te.criteria.id = :criteriaId) " +
            "and ((:evaluatorId is null and te.evaluator is null) or te.evaluator.id = :evaluatorId) " +
            "and ((:councilTeamId is null and te.councilTeamId is null) or te.councilTeamId = :councilTeamId)")
    TeamEvaluation search(Integer milestoneId, Integer teamId, Integer criteriaId, Integer evaluatorId, Integer councilTeamId);
    @Modifying
    @Query("delete from TeamEvaluation te where te.team.id = :id")
    void deleteByTeamId(Integer id);

    TeamEvaluation findByTeamAndMilestone(Team team, Milestone milestone);
}

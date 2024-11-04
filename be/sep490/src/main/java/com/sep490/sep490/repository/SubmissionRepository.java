package com.sep490.sep490.repository;

import com.sep490.sep490.entity.Submission;
import com.sep490.sep490.entity.Team;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SubmissionRepository extends BaseRepository<Submission,Integer>{

    Submission findByTeamIdAndMilestoneId(Integer teamId, Integer milestoneId);
    @Query("SELECT s FROM Submission s WHERE " +
            "(s.teamId in (:teamIds)) AND " +
            "( s.milestoneId = :milestoneId)")
//    @Query("SELECT s FROM Submission s WHERE " +
//            "(:teamId IS NULL OR s.team.id = :teamId) AND " +
//            "(:milestoneId IS NULL OR s.milestone.id = :milestoneId)")
    Page<Submission> search(List<Integer> teamIds, Integer milestoneId, Pageable pageable);
}

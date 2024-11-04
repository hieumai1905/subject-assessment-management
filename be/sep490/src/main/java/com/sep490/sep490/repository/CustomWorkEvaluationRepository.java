package com.sep490.sep490.repository;

import com.sep490.sep490.entity.WorkEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.HashSet;
import java.util.List;

@Repository
public interface CustomWorkEvaluationRepository extends JpaRepository<WorkEvaluation, Integer> {

    @Query(value = "select \n" +
            "    m.id as milestone_id,\n" +
            "    u.email,\n" +
            "    sum(\n" +
            "        case \n" +
            "            when we.is_update_eval = true then we.grade\n" +
            "            else coalesce(we1.grade, we.grade)\n" +
            "        end\n" +
            "    ) as total_grade\n" +
            "from \n" +
            "    requirement r\n" +
            "left join \n" +
            "    milestone m on m.id = r.milestone_id\n" +
            "left join \n" +
            "    users u on u.id = r.student_id\n" +
            "left join \n" +
            "    work_evaluation we on r.id = we.requirement_id and we.is_update_eval = true and we.student_id = :studentId \n" +
            "left join \n" +
            "    work_evaluation we1 on r.id = we1.requirement_id and we1.student_id = :studentId " +
            "       and ( we1.is_update_eval = false)\n" +
            "where \n" +
            "    m.id in (:milestoneIds)\n" +
            "group by \n" +
            "    m.id, u.email", nativeQuery = true)
    List<Object[]> getTotalLocByMilestoneAndStudent(List<Integer> milestoneIds, Integer studentId);
    @Query(value = "select \n" +
//            "    m.id as milestone_id,\n" +
            "    u.email,\n" +
            "    sum(\n" +
            "        case \n" +
            "            when we.is_update_eval = true then we.grade\n" +
            "            else coalesce(we1.grade, we.grade)\n" +
            "        end\n" +
            "    ) as total_grade\n" +
            "from \n" +
            "    requirement r\n" +
            "left join \n" +
            "    milestone m on m.id = r.milestone_id\n" +
            "left join \n" +
            "    users u on u.id = r.student_id and u.email in (:emailSet)\n" +
            "left join \n" +
            "    work_evaluation we on r.id = we.requirement_id and we.is_update_eval = true \n" +
            "left join \n" +
            "    work_evaluation we1 on r.id = we1.requirement_id  " +
            "       and (we1.is_update_eval = false)\n" +
            "where \n" +
            "    m.id in (:mileIds) \n" +
            "group by \n" +
            " u.email", nativeQuery = true)
    List<Object[]> findByEmailsAndMileIds(List<String> emailSet, List<Integer> mileIds);
    @Query(value = "select \n" +
//            "    m.id as milestone_id,\n" +
            "    u.email,\n" +
            "    sum(\n" +
            "        case \n" +
            "            when we.is_update_eval = false then we.grade\n" +
            "            else 0\n" +
            "        end\n" +
            "    ) as total_grade\n" +
            "from \n" +
            "    requirement r\n" +
            "left join \n" +
            "    milestone m on m.id = r.milestone_id\n" +
            "left join \n" +
            "    users u on u.id = r.student_id and u.email in (:emailSet)\n" +
            "left join \n" +
            "    work_evaluation we on r.id = we.requirement_id and we.is_update_eval = false \n" +
//            "left join \n" +
//            "    work_evaluation we1 on r.id = we1.requirement_id  " +
//            "       and (we1.is_update_eval = false)\n" +
            "where \n" +
            "    m.id = :id \n" +
            "group by \n" +
            " u.email", nativeQuery = true)
    List<Object[]> findByEmailsAndMileId(List<String> emailSet, Integer id);
    @Query(value = "select \n" +
            "    u.email,\n" +
            "    sum(\n" +
            "        case \n" +
            "            when we.is_update_eval = true then we.grade\n" +
            "            else coalesce(we1.grade, we.grade)\n" +
            "        end\n" +
            "    ) as total_grade\n" +
            "from \n" +
            "    requirement r\n" +
            "left join \n" +
            "    milestone m on m.id = r.milestone_id\n" +
            "left join \n" +
            "    users u on u.id = r.student_id and u.email in (:emailSet)\n" +
            "left join \n" +
            "    work_evaluation we on r.id = we.requirement_id and we.is_update_eval = true " +
            "       and (we.evaluator_id is null or (we.evaluator_id = :evaluatorId and we.council_team_id = :councilTeamId)) " +
            "\n" +
            "left join \n" +
            "    work_evaluation we1 on r.id = we1.requirement_id  " +
            "       and (we1.is_update_eval = false) " +
            "       and (we.evaluator_id is null or (we.evaluator_id = :evaluatorId and we.council_team_id = :councilTeamId)) " +
            "\n" +
            "where \n" +
            "    m.id in (:mileIds) \n" +
            "group by \n" +
            " u.email", nativeQuery = true)
    List<Object[]> findByEmailsAndMileIdsForGrandFinal(List<String> emailSet, List<Integer> mileIds,
                                                       Integer evaluatorId, Integer councilTeamId);
}

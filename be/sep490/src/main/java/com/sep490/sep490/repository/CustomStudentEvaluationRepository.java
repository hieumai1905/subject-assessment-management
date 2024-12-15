package com.sep490.sep490.repository;

import com.sep490.sep490.entity.Milestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomStudentEvaluationRepository extends JpaRepository<Milestone, Integer> {

    @Query(value = "SELECT \n" +
            "    u.fullname, \n" +
            "    u.email, \n" +
            "    t.id,\n" +
            "    t.team_name, \n" +
            "    concat('{\"id\":', m.id, ',\"name\":\"', m.title, '\"', ',\"weight\":', m.eval_weight," +
            "           ',\"expectedLoc\":', m.expected_loc, ',\"typeEvaluator\":\"', COALESCE(m.type_evaluator, 'TEACHER_IN_CLASS')," +
            "           '\"}') AS milestones,\n" +
            "    se1.eval_grade as eval_grade1,\n" +
            "    se1.comment AS comments1, \n" +
            "    string_agg(COALESCE(\n" +
            "        CASE WHEN mc.criteria_name IS NULL THEN null\n" +
            "             ELSE concat('{\"id\":', mc.id, ',\"name\":\"', mc.criteria_name, '\"', " +
            "                           ',\"weight\":', mc.eval_weight, ',\"locEvaluation\":',  " +
            "                           case when mc.loc_evaluation then 'true' else 'false' end , '}')\n" +
            "        END)\n" +
            "    , '|') AS criteria_names,\n" +
            "    string_agg(COALESCE(CAST(se.eval_grade AS VARCHAR), 'null'), '|') AS eval_grades, \n" +
            "    string_agg(COALESCE(se.comment, 'null'), '|') AS comments\n" +
            "FROM milestone m \n" +
            "LEFT JOIN milestone_criteria mc ON mc.milestone_id = m.id AND mc.parent_criteria_id IS NULL\n" +
            "LEFT JOIN team t ON m.id = t.milestone_id \n" +
            "LEFT JOIN team_member tm ON t.id = tm.team_id \n" +
            "LEFT JOIN users u ON u.id = tm.member_id \n" +
            "LEFT JOIN student_evaluation se ON (se.milestone_id = m.id AND se.criteria_id = mc.id AND se.user_id = u.id)\n" +
            "LEFT JOIN student_evaluation se1 ON (se1.milestone_id = m.id AND se1.criteria_id IS NULL AND se1.user_id = u.id)\n" +
            "WHERE m.class_id = :classId " +
            "AND (:teamId IS NULL OR t.id = :teamId) " +
            "AND (:milestoneId IS NULL OR m.id = :milestoneId) " +
            "GROUP BY u.fullname, u.email, m.id, m.title, t.id, t.team_name, se1.eval_grade, se1.comment " +
            "order by m.display_order, t.team_name",
            nativeQuery = true)
    List<Object[]> searchEval(
            @Param("classId") Integer classId,
            @Param("teamId") Integer teamId,
            @Param("milestoneId") Integer milestoneId
    );

    @Query(value = "SELECT \n" +
            "    u.fullname, \n" +
            "    u.email,\n" +
            "    string_agg(concat(\n" +
            "        '{\"id\":', m.id, \n" +
            "        ',\"name\":\"', m.title, \n" +
            "        '\",\"weight\":', m.eval_weight,\n" +
            "        ',\"expectedLoc\":', coalesce(m.expected_loc, 0),\n" +
            "\t\t',\"displayOrder\":', coalesce(m.display_order, 0),\n" +
            "        '}'\n" +
            "    ), '|') AS milestones,\n" +
            "    string_agg(COALESCE(CAST(se.eval_grade AS VARCHAR), 'null'), '|') AS eval_grades, \n" +
            "    string_agg(COALESCE(se.comment, 'null'), '|') AS comments\n" +
            "FROM milestone m \n" +
            "LEFT JOIN class_user csu on csu.class_id = m.class_id \n" +
            "LEFT JOIN users u ON u.id = csu.user_id and u.role_id = 4\n" +
            "LEFT JOIN student_evaluation se ON (se.milestone_id = m.id AND se.criteria_id IS NULL AND se.user_id = u.id)\n" +
            "WHERE m.class_id = :classId and m.type_evaluator <> 'Grand Final' \n" +
            "GROUP BY u.fullname, u.email",
            nativeQuery = true)
    List<Object[]> searchStudentEvaluationByMilestone(@Param("classId") Integer classId);

    @Query(value = "SELECT " +
            "    u.fullname AS fullname, " +
            "    u.email AS email, " +
            "    t.id AS teamId, " +
            "    t.team_name AS teamName, " +
            "    concat('{\"id\":', m.id, ',\"name\":\"', m.title, '\"}') AS milestones, " +
            "    string_agg(COALESCE( " +
            "        CASE WHEN mc.criteria_name IS NULL THEN 'null' " +
            "             ELSE concat('{\"id\":', mc.id, ',\"name\":\"', mc.criteria_name, '\"}') " +
            "        END " +
            "    ), '|') AS criteriaNames, " +
            "    string_agg(COALESCE(CAST(se.eval_grade AS VARCHAR), 'null'), '|') AS evalGrades, " +
            "    string_agg(COALESCE(se.comment, 'null'), '|') AS comments " +
            "FROM milestone m " +
            "LEFT JOIN milestone_criteria mc ON mc.milestone_id = m.id AND mc.parent_criteria_id IS NULL " +
            "LEFT JOIN team t ON m.id = t.milestone_id " +
            "LEFT JOIN team_member tm ON t.id = tm.team_id " +
            "LEFT JOIN users u ON u.id = tm.member_id " +
            "LEFT JOIN student_evaluation se ON se.milestone_id = m.id AND se.criteria_id = mc.id AND se.user_id = u.id " +
            "WHERE m.class_id = :classId " +
            "AND (:teamId IS NULL OR t.id = :teamId) " +
            "AND (:milestoneId IS NULL OR m.id = :milestoneId) " +
            "GROUP BY u.fullname, u.email, m.id, m.title, t.id, t.team_name",
            nativeQuery = true)
    List<Object[]> searchStudentEvaluationByMilestoneCriteria(@Param("classId") Integer classId,
                                                                          @Param("teamId") Integer teamId,
                                                                          @Param("milestoneId") Integer milestoneId);

    @Query(value = "WITH GradeData AS (\n" +
            "    SELECT \n" +
            "        se.user_id, \n" +
            "        (sum(se.eval_grade) / count(m.id)) AS average_grade\n" +
            "    FROM student_evaluation se \n" +
//            "    JOIN users u ON se.user_id = u.id AND u.role_id = 4\n" +
            "    JOIN milestone m ON se.milestone_id = m.id AND m.evaluation_type <> 'Grand Final'\n" +
            "    JOIN classes c ON c.id = m.class_id\n" +
            "    WHERE c.semester_id = :semesterId \n" +
            "    AND c.subject_id = :subjectId AND c.active = true \n" +
            "    AND se.criteria_id IS NULL \n" +
            "    AND se.council_team_id IS NULL\n" +
            "    GROUP BY se.user_id\n" +
            ")\n" +
            "SELECT \n" +
            "    '0_1' AS Grade,\n" +
            "    COUNT(*) AS Number\n" +
            "FROM GradeData\n" +
            "WHERE average_grade >= 0 AND average_grade <= 1\n" +
            "\n" +
            "UNION ALL\n" +
            "\n" +
            "SELECT \n" +
            "    '1_2' AS Grade,\n" +
            "    COUNT(*) AS Number\n" +
            "FROM GradeData\n" +
            "WHERE average_grade > 1 AND average_grade <= 2\n" +
            "\n" +
            "UNION ALL\n" +
            "\n" +
            "SELECT \n" +
            "    '2_3' AS Grade,\n" +
            "    COUNT(*) AS Number\n" +
            "FROM GradeData\n" +
            "WHERE average_grade > 2 AND average_grade <= 3\n" +
            "\n" +
            "UNION ALL\n" +
            "\n" +
            "SELECT \n" +
            "    '3_4' AS Grade,\n" +
            "    COUNT(*) AS Number\n" +
            "FROM GradeData\n" +
            "WHERE average_grade > 3 AND average_grade <= 4\n" +
            "\n" +
            "UNION ALL\n" +
            "\n" +
            "SELECT \n" +
            "    '4_5' AS Grade,\n" +
            "    COUNT(*) AS Number\n" +
            "FROM GradeData\n" +
            "WHERE average_grade > 4 AND average_grade < 5\n" +
            "\n" +
            "UNION ALL\n" +
            "\n" +
            "SELECT \n" +
            "    '5_6' AS Grade,\n" +
            "    COUNT(*) AS Number\n" +
            "FROM GradeData\n" +
            "WHERE average_grade >= 5 AND average_grade <= 6\n" +
            "\n" +
            "UNION ALL\n" +
            "\n" +
            "SELECT \n" +
            "    '6_7' AS Grade,\n" +
            "    COUNT(*) AS Number\n" +
            "FROM GradeData\n" +
            "WHERE average_grade > 6 AND average_grade <= 7\n" +
            "\n" +
            "UNION ALL\n" +
            "\n" +
            "SELECT \n" +
            "    '7_8' AS Grade,\n" +
            "    COUNT(*) AS Number\n" +
            "FROM GradeData\n" +
            "WHERE average_grade > 7 AND average_grade <= 8\n" +
            "\n" +
            "UNION ALL\n" +
            "\n" +
            "SELECT \n" +
            "    '8_9' AS Grade,\n" +
            "    COUNT(*) AS Number\n" +
            "FROM GradeData\n" +
            "WHERE average_grade > 8 AND average_grade <= 9\n" +
            "\n" +
            "UNION ALL\n" +
            "\n" +
            "SELECT \n" +
            "    '9_10' AS Grade,\n" +
            "    COUNT(*) AS Number\n" +
            "FROM GradeData\n" +
            "WHERE average_grade > 9 AND average_grade <= 10;", nativeQuery = true)
    List<Object[]> getDistributionGrades(Integer semesterId, Integer subjectId);


    @Query(value = "SELECT \n" +
            "    m.display_order, \n" +
            "    AVG(se.eval_grade) AS average_grade\n" +
            "FROM student_evaluation se \n" +
            "JOIN users u ON se.user_id = u.id AND u.role_id = 4\n" +
            "JOIN milestone m ON se.milestone_id = m.id \n" +
            "JOIN classes c ON c.id = m.class_id\n" +
            "WHERE se.criteria_id IS NULL AND c.active = true \n" +
            "AND se.evaluator_id IS NULL AND c.semester_id = :semesterId AND c.subject_id = :subjectId \n" +
            "GROUP BY m.display_order \n" +
            "ORDER BY m.display_order;", nativeQuery = true)
    List<Object[]> getAvgGradeByMilestone(Integer semesterId, Integer subjectId);

    @Query(value = "SELECT \n" +
            "    se.total_loc, \n" +
            "    COUNT(DISTINCT we.requirement_id) AS num_req, \n" +
            "    u.email, \n" +
            "    m.display_order, \n" +
            "    c.class_code \n" +
            "FROM \n" +
            "    student_evaluation se\n" +
            "JOIN \n" +
            "    work_evaluation we ON we.student_id = se.user_id AND we.milestone_id = se.milestone_id\n" +
            "JOIN \n" +
            "    milestone m ON m.id = se.milestone_id\n" +
            "JOIN \n" +
            "    classes c ON c.id = m.class_id \n" +
            "JOIN \n" +
            "    users u ON u.id = se.user_id\n" +
            "WHERE \n" +
            "    se.criteria_id IS NULL \n" +
            "    AND se.evaluator_id IS NULL\n" +
            "    AND c.subject_id = :subjectId \n" +
            "    AND c.semester_id = :semesterId AND c.active = true \n" +
            "GROUP BY \n" +
            "    se.total_loc, u.email, m.display_order, c.class_code\n" +
            "ORDER BY \n" +
            "    se.total_loc DESC\n" +
            "LIMIT 10;\n", nativeQuery = true)
    List<Object[]> getTopLOC(Integer semesterId, Integer subjectId);

    @Query(value = "SELECT \n" +
            "\tc.class_code,\n" +
            "\tte.email,\n" +
            "\t(sum(se.eval_grade * m.eval_weight / 100) / count(distinct se.user_id)) AS average_grade\n" +
            "FROM student_evaluation se \n" +
            "JOIN milestone m ON se.milestone_id = m.id\n" +
            "JOIN classes c ON c.id = m.class_id\n" +
            "JOIN users u on u.id = se.user_id\n" +
            "JOIN users te on te.id = c.teacher_id\n" +
            "where se.criteria_id IS NULL \n" +
            "AND se.evaluator_id IS NULL AND c.subject_id = :subjectId AND c.semester_id = :semesterId " +
            " AND c.active = true \n" +
            "GROUP BY c.class_code, te.email " +
            "order by average_grade desc limit 10", nativeQuery = true)
    List<Object[]> getAvgClass(Integer semesterId, Integer subjectId);

}

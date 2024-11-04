package com.sep490.sep490.repository;

import com.sep490.sep490.entity.EvaluationCriteria;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Repository
public interface EvaluationCriteriaRepository extends BaseRepository<EvaluationCriteria, Integer>{
    @Query("select e from EvaluationCriteria e where lower(e.criteriaName) = lower(?1) " +
            "and e.evalWeight = ?2 " +
            "and e.assignment.id = ?3 ")
    EvaluationCriteria findByCriteriaNameAndEvalWeight(String name, Integer evalWeight, Integer assignmentId);
    @Query("select e from EvaluationCriteria e where e.id <> ?1 " +
            "and lower(e.criteriaName) = lower(?2) " +
            "and e.evalWeight = ?3 " +
            "and e.assignment.id = ?4 ")
    EvaluationCriteria findByNameAndWeightWithOtherId(Integer id, String name, Integer evalWeight, Integer assignmentId);

    @Query("SELECT a FROM EvaluationCriteria a WHERE " +
            "(:criteriaName IS NULL OR LOWER(a.criteriaName) like %:criteriaName%) AND " +
            "(:assignmentId IS NULL OR a.assignment.id = :assignmentId) AND " +
            "(:minEvalWeight IS NULL OR a.evalWeight >= :minEvalWeight) AND " +
            "(:maxEvalWeight IS NULL OR a.evalWeight <= :maxEvalWeight) AND " +
            "(:active is null or a.active = :active)")
    Page<EvaluationCriteria> search(
            @Param("criteriaName") String criteriaName,
            @Param("assignmentId") Integer assignmentId,
            @Param("minEvalWeight") Integer minEvalWeight,
            @Param("maxEvalWeight") Integer maxEvalWeight,
            @Param("active") Boolean active,
            Pageable pageable);

    List<EvaluationCriteria> findByAssignmentId(Integer assignmentId);

    @Modifying
    @Query("DELETE FROM EvaluationCriteria e WHERE e.assignment.id = :assignmentId")
    void deleteByAssignmentId(@Param("assignmentId") Integer assignmentId);
}

package com.sep490.sep490.repository;

import com.sep490.sep490.entity.Assignment;
import com.sep490.sep490.entity.Subject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AssignmentRepository extends BaseRepository<Assignment,Integer>{
    @Query("SELECT a FROM Assignment a WHERE " +
            "(:assignmentTitle IS NULL OR LOWER(a.assignmentTitle) LIKE LOWER(CONCAT('%', :assignmentTitle, '%'))) AND " +
            "(:subjectId IS NULL OR a.subject.id = :subjectId) AND " +
            "(:minExpectedLoc IS NULL OR a.expectedLoc >= :minExpectedLoc) AND " +
            "(:maxExpectedLoc IS NULL OR a.expectedLoc <= :maxExpectedLoc) AND " +
            "(:active IS NULL OR a.active = :active)")
    Page<Assignment> search(
            @Param("assignmentTitle") String assignmentTitle,
            @Param("subjectId") Integer subjectId,
            @Param("minExpectedLoc") Integer minExpectedLoc,
            @Param("maxExpectedLoc") Integer maxExpectedLoc,
            @Param("active") Boolean active,
            Pageable pageable);
    List<Assignment> findBySubjectId(Integer subjectId);
    @Query("select a from Assignment a where lower(a.assignmentTitle) = :assignmentTitle " +
            "and a.subject.id = :subjectId")
    Optional<Assignment> findByAssignmentTitleAndSubjectId(String assignmentTitle, Integer subjectId);

    @Query("select a from Assignment a where a.id <> :id " +
            "and lower(a.assignmentTitle) = :title " +
            "and a.subject.id = :subjectId")
    Optional<Assignment> foundByTitleWithOtherId(Integer id, String title, Integer subjectId);

    List<Assignment> findBySubject(Subject subject);

    @Query("SELECT SUM(a.evalWeight) FROM Assignment a WHERE a.subject = :subject")
    int getTotalEvalWeightBySubject(@Param("subject") Subject subject);

    boolean existsBySubjectAndAssignmentTitle(Subject subject, String title);

    Object findAssignmentBySubjectId(Integer subjectId);

    @Query("SELECT a FROM Assignment a WHERE a.subject.id = :subjectId and a.active = :b " +
            "order by a.displayOrder")
    List<Assignment> findBySubjectAndActive(Integer subjectId, boolean b);
}

package com.sep490.sep490.repository;

import com.sep490.sep490.entity.Assignment;
import com.sep490.sep490.entity.Classes;
import com.sep490.sep490.entity.Milestone;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MilestoneRepository extends BaseRepository<Milestone, Integer>{
    @Query("SELECT m From Milestone m where (m.classes.id = :classId) " +
//            "and (:assignmentId is null or m.assignment.id = :assignmentId) " +
            "and (:active is null or m.active = :active)")
    Page<Milestone> search(Integer classId,
//                           Integer assignmentId,
                           Boolean active, Pageable pageable);
    @Query("select m from Milestone m where m.classes.id = :classId " +
            "and lower(m.title) = lower(:title) " +
            "and m.id <> :milestoneId")
    Milestone findByTitle(String title, Integer milestoneId, Integer classId);

//    int countByIdInAndAssignment(List<Integer> ids, Assignment assignment);
//
//    List<Milestone> findAllByAssignmentAndClasses(Assignment assignment, Classes classes);
//
//    Milestone findByAssignmentAndClasses(Assignment assignment, Classes classes);
//    List<Milestone> findAllByClasses(Classes classes);
}

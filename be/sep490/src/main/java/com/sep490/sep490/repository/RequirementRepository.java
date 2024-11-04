package com.sep490.sep490.repository;

import com.sep490.sep490.entity.Requirement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface RequirementRepository extends  BaseRepository<Requirement, Integer>{
    @Query("select r from Requirement r where (:title is null or lower(r.reqTitle) like %:title%) " +
            "and r.team is not null " +
            "and (:status is null or lower(r.status) = :status) " +
            "and (:complexityId is null or r.complexity.id = :complexityId) " +
            "and (:assigneeId is null or r.student.id = :assigneeId) " +
            "and (:teamId is null or r.team.id = :teamId) " +
            "and (:milestoneId is null or r.milestone.id = :milestoneId) " +
//            "and (:isCurrentRequirements = false or " +
//            "   r.id in (select re.id from Requirement re " +
//            "       join Team t on re.team.id = t.id " +
//            "       join TeamMember tm on tm.team.id = t.id " +
//            "       where tm.member.id = :userId))" +
            "")
    Page<Requirement> search(String title, String status, Integer complexityId,
                             Integer assigneeId, Integer teamId, Integer milestoneId,
//                             Boolean isCurrentRequirements, Integer userId,
                             Pageable pageable);
    @Modifying
    @Query("delete from Requirement r where r.team.id = :teamId " +
            "and (:milestoneId is null or r.milestone.id = :milestoneId)")
    void deleteByTeamId(Integer teamId, Integer milestoneId);
    @Modifying
    @Query("delete from Requirement r where r.id in (:ids)")
    void deleteAllByIds(List<Integer> ids);
    @Modifying
    @Query("update Requirement r set r.student = null, r.status = 'TO DO', " +
            "r.submission = null, r.submitType = null " +
            "where r.team.id = :teamId and r.student.id = :memberId")
    void resetStudentInRequirements(Integer teamId, Integer memberId);
    @Query("select r from Requirement r where r.team is not null and r.team.id = :teamId " +
            "and lower(r.reqTitle) = lower(:reqTitle) " +
            "and (:id is null or r.id <> :id)")
    Requirement checkExistedByTitle(Integer id, Integer teamId, String reqTitle);
    @Query("select r from Requirement r where r.milestone.id in (:milestoneIds) " +
            "and (:teamId is null or r.team.id = :teamId) " +
            "and (:title is null or r.reqTitle like %:title%) ")
    Page<Requirement> searchByClass(List<Integer> milestoneIds, Integer teamId, String title, Pageable pageable);
    @Query("select r from Requirement r where r.team is null and r.milestone.id = :id " +
            "and lower(r.reqTitle) = :title ")
    Requirement checkExistedByTitleInMilestone(Integer id, String title);

    // Find All by SubmissionId
    List<Requirement> findAllBySubmissionId(Integer submissionId);
    @Modifying
    @Query("update Requirement r set r.submissionId = null where r.id not in (:requirementIds) and r.submissionId = :id")
    void resetSubmitId(List<Integer> requirementIds, Integer id);
    @Query("select r from Requirement r where r.team.id = :teamId and r.milestone.id = :mileId " +
            "and lower(r.reqTitle) = :reqTitle ")
    Requirement checkExistedByTitleAndMileId(Integer mileId, Integer teamId, String reqTitle);

    @Query(value = "select ROUND((count(r.id)  * 1.0 / count(distinct r.student_id)), 2) as num_req, s.name, m.display_order from requirement r\n" +
            "join setting s on s.id = r.complexity_id " +
            "join milestone m on m.id = r.milestone_id and m.type_evaluator <> 'Grand Final' \n" +
            "join classes c on m.class_id = c.id " +
            "where r.student_id is not null and r.complexity_id is not null\n" +
            "and c.subject_id = :subjectId and c.semester_id = :semesterId AND c.active = true \n" +
            "group by s.name, m.display_order\n" +
            "order by m.display_order", nativeQuery = true)
    List<Object[]> getAverageRequirementsPerMember(Integer semesterId, Integer subjectId);
}

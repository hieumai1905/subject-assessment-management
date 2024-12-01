package com.sep490.sep490.repository;

import com.sep490.sep490.entity.ClassUser;
import com.sep490.sep490.entity.Classes;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ClassesRepository extends BaseRepository<Classes,Integer>{
    @Query("SELECT c FROM Classes c " +
            "WHERE (:subjectId IS NULL OR c.subject.id = :subjectId) " +
            "AND (:teacherId IS NULL OR c.teacher.id = :teacherId) " +
            "AND (:settingId IS NULL OR c.semester.id = :settingId) " +
            "AND (:keyWord IS NULL OR LOWER(c.classCode) LIKE %:keyWord% OR LOWER(c.name) LIKE %:keyWord% ) " +
            "AND (:active IS NULL OR c.active = :active) " +
            "AND (:isCurrentClass = false or " +
            "   c.teacher.id = :userId  " +
            " or c.id in (select csu.classes.id from ClassUser csu where csu.user.id = :userId and csu.user.role.id = 4))"
    )
    Page<Classes> search(@Param("subjectId") Integer subjectId,
                         @Param("teacherId") Integer teacherId,
                         @Param("settingId") Integer settingId,
                         @Param("keyWord") String keyWord,
                         @Param("active") Boolean active,
                         @Param("isCurrentClass") Boolean isCurrentClass,
                         @Param("userId") Integer userId,
//                         @Param("roleId") Integer roleId,
                         Pageable pageable);
    @Query("SELECT c FROM Classes c " +
            "WHERE (:classCode IS NULL OR c.classCode = :classCode) " +
            "AND (:settingId IS NULL OR c.semester.id = :settingId)"+
            "AND (:classId IS NULL Or c.id <> :classId)")
    Optional<Classes> findFirstByClassCodeAndSettingId(@Param("classCode") String classCode,
                                                       @Param("settingId") Integer settingId,
                                                       @Param("classId") Integer classId);

    @Query("SELECT c FROM Classes c JOIN ClassUser cu " +
            "ON c.id = cu.classes.id" +
            " WHERE cu.user.id = :userId " +
            "AND c.semester.id = :semesterId" +
            " AND c.subject.id = :subjectId")
    List<Classes> findByUserIdAndSemesterIdAndSubjectId(@Param("userId") Integer studentId,
                                                        @Param("semesterId") Integer semesterId,
                                                        @Param("subjectId") Integer subjectId);
    @Query("select c from Classes c where c.id in (:ids)")
    List<Classes> findByIds(List<Integer> ids);
    @Query("select c from Classes c where c.semester.id = :id and c.active = true")
    List<Classes> findBySemesterId(Integer id);
    @Query("select c from Classes c where c.semester.id = :semesterId and c.subject.id = :subjectId and c.active = true")
    List<Classes> findBySemesterIdAndSubjectId(Integer semesterId, Integer subjectId);
}

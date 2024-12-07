package com.sep490.sep490.repository;

import com.sep490.sep490.entity.Subject;
import com.sep490.sep490.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SubjectRepository extends BaseRepository<Subject, Integer>{
    @Query("select s from Subject s where lower(s.subjectCode) = :subjectCode")
    Subject findBySubjectCode(String subjectCode);

    @Query("select s from Subject s where lower(s.subjectName) = :subjectName " +
            "and s.id <> :id")
    Subject findBySubjectNameAndOtherId(String subjectName, Integer id);
    @Query("select s from Subject s " +
            "where (:nameOrCode is null or lower(s.subjectName) like %:nameOrCode% " +
                "or lower(s.subjectCode) like %:nameOrCode%) " +
            "and (:managerId is null or :managerId in (select m.id from s.managers m)) " +
            "and (:active is null or s.active = :active) " +
            "and (:isCouncil is null or s.isCouncil = :isCouncil) ")
    Page<Subject> search(String nameOrCode,
                         Integer managerId,
                         Boolean active,
                         Boolean isCouncil,
                         Pageable pageable);
    @Query("select s from Subject s where lower(s.subjectName) = :subjectName")
    Subject findBySubjectName(String subjectName);
    @Query("select s from Subject s where lower(s.subjectCode) = :subjectCode " +
            "and s.id <> :id")
    Subject findBySubjectCodeAndOtherId(String subjectCode, Integer id);

    /*@Query("SELECT u FROM User u " +
            "LEFT JOIN u.subjects s ON s.id = :subjectId " +
            "WHERE ((s.id = :subjectId AND :type = 'added') OR (s.id IS NULL AND :type = 'not_added')) " +
            "AND (:keyWord IS NULL OR u.fullname LIKE %:keyWord% OR u.username LIKE %:keyWord%)")
    Page<User> searchSubjectTeacher(@Param("keyWord") String keyWord,
                                    @Param("subjectId") Integer subjectId,
                                    @Param("type") String type,
                                    Pageable pageable);*/

    @Query("SELECT u FROM User u " +
            "WHERE (:subjectId IS NOT NULL AND :subjectId in (select s.id from u.subjects s) AND :type = 'added') " +
            "AND (:keyWord IS NULL OR lower(u.fullname) LIKE %:keyWord% OR lower(u.email) LIKE %:keyWord%)")
    Page<User> searchSubjectTeacher(@Param("keyWord") String keyWord,
                                    @Param("subjectId") Integer subjectId,
                                    @Param("type") String type,
                                    Pageable pageable);
    @Query("SELECT u FROM User u " +
            "LEFT JOIN u.subjects s " +
            "WHERE ((:subjectId IS NOT NULL AND s.id = :subjectId AND :type = 'added') " +
            "OR (:subjectId IS NOT NULL AND s.id IS NULL AND :type = 'not_added' AND u.role.id = 3)) " +
            "AND (:userId IS NULL OR u.id = :userId)")
    Object checkSubjectTeacher( @Param("subjectId") Integer subjectId,
                                @Param("type") String type,
                                    @Param("userId") Integer userId);


}

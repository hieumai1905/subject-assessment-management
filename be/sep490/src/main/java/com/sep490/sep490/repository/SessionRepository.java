package com.sep490.sep490.repository;

import com.sep490.sep490.entity.Session;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SessionRepository extends BaseRepository<Session, Integer>{
   @Query("select s from Session s where s.name = :name and s.semesterId = :semesterId " +
           "and s.subjectSettingId in (:roundIds) " +
           "and (:sessionId is null or s.id <> :sessionId)")
    Session checkExistByName(String name, Integer semesterId, Integer sessionId, List<Integer> roundIds);
    @Query("select s from Session s where s.subjectSettingId = :settingId and s.semesterId = :semesterId")
    Page<Session> search(Integer settingId, Integer semesterId, Pageable pageable);
    @Modifying
    @Query("delete from Session s where s.id = :id")
    void deleteBySessionId(Integer id);
   @Query("select s from Session s where s.semesterId = :semesterId and s.subjectSettingId = :roundId")
    List<Session> findBySemesterIdAndRoundId(Integer semesterId, Integer roundId);
}

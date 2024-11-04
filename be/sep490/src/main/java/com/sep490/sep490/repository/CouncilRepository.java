package com.sep490.sep490.repository;

import com.sep490.sep490.entity.Council;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CouncilRepository extends BaseRepository<Council, Integer>{
   @Modifying
   @Query("delete from CouncilMember cm where cm.council.id = :id")
   void removeMemberById(Integer id);

    @Modifying
    @Query("delete from Council cm where cm.id = :id")
    void deleteByCouncilId(Integer id);
    @Query("select c from Council c where c.semesterId = :semesterId and c.subjectSettingId = :settingId")
    Page<Council> search(Integer settingId, Integer semesterId, Pageable pageable);
    @Modifying
    @Query("delete from CouncilMember cm where cm.council.id = :id")
    void deleteMemberById(Integer id);

    @Query("select c from Council c where c.semesterId = :semesterId and c.subjectSettingId = :settingId")
    List<Council> findBySemesterIdAndRoundId(Integer settingId, Integer semesterId);
    @Query("select size(c.council.councilMembers) from CouncilTeam c where c.council is not null and c.id = :councilTeamId")
    Integer findCouncilMemberCountByCouncilTeamId(@Param("councilTeamId") Integer councilTeamId);

}

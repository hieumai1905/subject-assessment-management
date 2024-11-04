package com.sep490.sep490.repository;

import com.sep490.sep490.entity.Requirement;
import com.sep490.sep490.entity.UpdateTracking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UpdateTrackingRepository extends  BaseRepository<UpdateTracking, Integer>{
    @Modifying
    @Query("delete from UpdateTracking ut where ut.requirement.id in (:ids)")
    void deleteByReqIds(List<Integer> ids);

    @Modifying
    @Query("delete from UpdateTracking ut where ut.requirement.id " +
            "in (select r.id from Requirement r where r.team.id = :teamId and r.student.id = :memberId)")
    void deleteByTeamIdAndMemberId(Integer teamId, Integer memberId);
    @Modifying
    @Query("delete from UpdateTracking ut where ut.id = :id")
    void deleteByUpdateId(Integer id);
}

package com.sep490.sep490.repository;

import com.sep490.sep490.entity.Milestone;
import com.sep490.sep490.entity.MilestoneCriteria;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MilestoneCriteriaRepository extends BaseRepository<MilestoneCriteria, Integer>{
//    List<MilestoneCriteria> findAllByParentCriteriaId(Integer parentId);
//    List<MilestoneCriteria> findAllByMilestoneAndParentCriteriaId(Milestone milestone, Integer parentId);
    @Query("SELECT m From MilestoneCriteria m where (m.milestone.id = :milestoneId) " +
//            "and (:parentCriteriaId is null or m.parentCriteria.id = :parentCriteriaId) " +
            "and (:active is null or m.active = :active)")
    Page<MilestoneCriteria> search(Integer milestoneId, Boolean active, Pageable pageable);
    boolean existsByIdAndIdInAndActiveTrue(Integer milestoneId, List<Integer> ids);
//    List<MilestoneCriteria> findAllByIdInAndIdNotInAndParentCriteriaIdAndActiveTrue(List<Integer> dbs, List<Integer> reqs, Integer parentId);
//    List<MilestoneCriteria> findAllByParentCriteriaIdAndActiveTrue(Integer parentId);
    @Modifying
    @Query("delete from MilestoneCriteria m where m.id in (:ids)")
    void deleteAllByIds(List<Integer> ids);
    @Query("select mc from MilestoneCriteria mc where lower(mc.criteriaName) = lower(:criteriaName) and mc.id <> :id " +
            "and mc.milestone.id = :milestoneId")
    MilestoneCriteria findByName(String criteriaName, Integer id, Integer milestoneId);
}

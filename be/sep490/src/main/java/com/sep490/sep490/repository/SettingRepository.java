package com.sep490.sep490.repository;

import com.sep490.sep490.entity.Setting;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SettingRepository extends BaseRepository<Setting, Integer>{
    List<Setting> findByIdAndSettingType(Integer id, String settingType);

    @Query("select s from Setting s where lower(s.name) = :name " +
            "and s.settingType = :settingType " +
            "and (:subjectId is null or s.subject.id = :subjectId)")
    Setting findByNameAndSettingType(String name, String settingType, Integer subjectId);
    List<Setting> findBySettingType(String settingType);
    @Query("select s from Setting s where (:name is null or lower(s.name) like %:name%) " +
            "and (:settingType is null or s.settingType = :settingType) " +
            "and (:active is null or s.active = :active) " +
//            "and (:subjectId is null or s.subject.id = :subjectId) " +
            "and ((:isSubjectSetting = false and s.subject is null) " +
            "   or (:isSubjectSetting = true and s.subject.id = :subjectId))")
    Page<Setting> search(String name, String settingType, Boolean active, Integer subjectId,
                         Boolean isSubjectSetting, Pageable pageable);

    @Query("select s from Setting s where s.id <> :id " +
            "and lower(s.name) = :name " +
            "and s.settingType = :settingType " +
            "and (:subjectId is null or s.subject.id = :subjectId)")
    Setting findByNameAndSettingTypeWithOtherId(Integer id, String name, String settingType, Integer subjectId);

    @Query("SELECT u FROM Setting u WHERE lower(u.settingType) = :semester")
    List<Object> findSettingBySettingType(String semester);

    @Query("SELECT u FROM Setting u WHERE lower(u.settingType) = :semester AND u.id= :id")
    Object findSettingBySettingTypeAndSettingId(String semester,Integer id);
    @Query("SELECT s FROM Setting s WHERE lower(s.settingType) = lower(:type) and s.id = :id")
    Optional<Setting> findSettingByTypeAndId(String type, Integer id);
}

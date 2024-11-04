package com.sep490.sep490.repository;

import com.sep490.sep490.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends BaseRepository<User, Integer>{
    User findByUsername(String username);
    User findFirstByEmail(String email);
    User findByEmailAndActiveTrue(String email);
    User findManagerByRoleId(Integer managerId);
    @Query("select u from User u where u.id <> :id and lower(u.username) = :username")
    User findExitedUsernameForUpdateUser(
            @Param("id") Integer id,
            @Param("username") String username
    );

    @Query("select u from User u where u.id <> :id and lower(u.email) = :email ")
    User findExitedEmailForUpdateUser(
            @Param("id") Integer id,
            @Param("email") String email
    );
    @Query("select u from User u where (:keyWord is null or lower(u.fullname) like %:keyWord% " +
            "   or lower(u.username) like %:keyWord% or lower(u.email) like %:keyWord% " +
            "   or lower(u.mobile) like %:keyWord%) " +
            "and (:roleName is null or lower(u.role.name) = :roleName) " +
            "and (:status is null or :status = u.status)" +
            "and (:active is null or :active = u.active)")
    Page<User> search(String keyWord, String roleName, String status, Boolean active, Pageable pageable);

    @Query("SELECT u FROM User u JOIN FETCH u.role WHERE u.role.id = :id")
    List<Object> findUserByRoleId(Integer id);

    @Query("select u from User u join TeamMember tm on u.id = tm.member.id join Team t on tm.team.id = t.id join Classes c on t.classes.id = c.id where " +
            "(:classId is null or c.id = :classId) " +
            "and (:teamId is null or t.id = :teamId)" +
            "and u.role.id = 4")
    List<User> searchTemplateStudentEval(@Param("classId") Integer classId,
                                         @Param("teamId") Integer teamId);
    List<User> findByActiveTrue();
    List<User> findByActiveFalse();
}

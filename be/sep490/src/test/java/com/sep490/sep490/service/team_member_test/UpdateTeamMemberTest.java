package com.sep490.sep490.service.team_member_test;

import com.sep490.sep490.common.exception.ApiInputException;
import com.sep490.sep490.common.exception.ConflictException;
import com.sep490.sep490.common.exception.RecordNotFoundException;
import com.sep490.sep490.dto.team_member.request.UpdateTeamMemberRequest;
import com.sep490.sep490.entity.*;
import com.sep490.sep490.repository.*;
import com.sep490.sep490.service.TeamMemberService;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UpdateTeamMemberTest {
    @Mock
    private TeamMemberRepository teamMemberRepository;
    @Mock
    private StudentEvaluationRepository studentEvaluationRepository;
    @Mock
    private UpdateTrackingRepository updateTrackingRepository;
    @Mock
    private WorkEvaluationRepository workEvaluationRepository;
    @Mock
    private RequirementRepository requirementRepository;
    @Mock
    private TeamRepository teamRepository;
    @InjectMocks
    private TeamMemberService teamMemberService;
    private Team team;
    private User user;
    private Team newTeam;
    private TeamMember teamMember;
    private Classes classes;
    @BeforeEach
    public void Setup(){
        team = new Team();
        Milestone milestone = new Milestone();
        milestone.setId(1);
        team.setId(1);
        team.setMilestone(milestone);

        user = new User();
        user.setId(1);

        teamMember = new TeamMember();
        teamMember.setTeam(team);
        teamMember.setMember(user);

        newTeam = new Team();
        newTeam.setId(2);

        classes = new Classes();
        ClassUser classUser = new ClassUser();
        classUser.setUser(user);
        classes.setClassesUsers(Collections.singletonList(classUser));
        newTeam.setClasses(classes);
    }

    @Test
    public void updateTeamMember_successUpdate() {
        Integer oldTeamId = 1;
        Integer newTeamId = 2;
        Integer memberId = 1;

        UpdateTeamMemberRequest request = new UpdateTeamMemberRequest();
        request.setOldTeamId(oldTeamId);
        request.setNewTeamId(newTeamId);
        request.setMemberId(memberId);

        // Mock dependencies
        when(teamMemberRepository.findByTeamIdAndMemberId(oldTeamId, memberId)).thenReturn(teamMember);
        when(teamRepository.findById(newTeamId)).thenReturn(Optional.of(newTeam));

        // Do not mock void methods
        doNothing().when(studentEvaluationRepository).deleteByMilestoneIdAndMemberId(anyInt(), anyInt());
        doNothing().when(updateTrackingRepository).deleteByTeamIdAndMemberId(anyInt(), anyInt());
        doNothing().when(workEvaluationRepository).deleteByTeamIdAndMemberId(anyInt(), anyInt());
        doNothing().when(requirementRepository).resetStudentInRequirements(anyInt(), anyInt());

        assertDoesNotThrow(() -> teamMemberService.updateTeamMember(request));

        verify(studentEvaluationRepository, times(1)).deleteByMilestoneIdAndMemberId(team.getMilestone().getId(), user.getId());
        verify(updateTrackingRepository, times(1)).deleteByTeamIdAndMemberId(team.getId(), user.getId());
        verify(workEvaluationRepository, times(1)).deleteByTeamIdAndMemberId(team.getId(), user.getId());
        verify(requirementRepository, times(1)).resetStudentInRequirements(team.getId(), user.getId());
        verify(teamMemberRepository, times(1)).save(any(TeamMember.class));
    }

    @Test
    public void updateTeamMember_oldTeamMemberNotFound() {
        Integer oldTeamId = 1;
        Integer memberId = 1;

        UpdateTeamMemberRequest request = new UpdateTeamMemberRequest();
        request.setOldTeamId(oldTeamId);
        request.setNewTeamId(null);
        request.setMemberId(memberId);

        // Mock dependencies
        when(teamMemberRepository.findByTeamIdAndMemberId(oldTeamId, memberId)).thenReturn(null);

        assertThrows(RecordNotFoundException.class, () -> teamMemberService.updateTeamMember(request));
    }

    @Test
    public void updateTeamMember_teamNotFound() {
        Integer newTeamId = 2;
        Integer memberId = 1;

        UpdateTeamMemberRequest request = new UpdateTeamMemberRequest();
        request.setOldTeamId(null);
        request.setNewTeamId(newTeamId);
        request.setMemberId(memberId);

        // Mock dependencies
        when(teamRepository.findById(newTeamId)).thenReturn(Optional.empty());

        assertThrows(RecordNotFoundException.class, () -> teamMemberService.updateTeamMember(request));
    }

    @Test
    public void updateTeamMember_invalidRequest() {
        UpdateTeamMemberRequest request = new UpdateTeamMemberRequest();
        request.setOldTeamId(null);
        request.setNewTeamId(null);
        request.setMemberId(1);

        assertThrows(ApiInputException.class, () -> teamMemberService.updateTeamMember(request));
    }

    @Test
    public void updateTeamMember_successAddNewMember() {
        Integer newTeamId = 2;
        Integer memberId = 1;

        UpdateTeamMemberRequest request = new UpdateTeamMemberRequest();
        request.setOldTeamId(null);
        request.setNewTeamId(newTeamId);
        request.setMemberId(memberId);

        // Mock dependencies
        when(teamRepository.findById(newTeamId)).thenReturn(Optional.of(newTeam));

        // Mock repository methods
        when(teamMemberRepository.save(any(TeamMember.class))).thenReturn(teamMember);

        assertDoesNotThrow(() -> teamMemberService.updateTeamMember(request));

        verify(teamMemberRepository, times(1)).save(any(TeamMember.class));
    }

    @Test
    public void updateTeamMember_newTeamNotFound() {
        Integer newTeamId = 2;
        Integer memberId = 1;

        UpdateTeamMemberRequest request = new UpdateTeamMemberRequest();
        request.setOldTeamId(null);
        request.setNewTeamId(newTeamId);
        request.setMemberId(memberId);

        // Mock repository behavior
        when(teamRepository.findById(newTeamId)).thenReturn(Optional.empty());

        // Expect exception when new team is not found
        assertThrows(RecordNotFoundException.class, () -> teamMemberService.updateTeamMember(request));

        // Verify that no other methods are called
        verify(studentEvaluationRepository, never()).deleteByMilestoneIdAndMemberId(anyInt(), anyInt());
        verify(updateTrackingRepository, never()).deleteByTeamIdAndMemberId(anyInt(), anyInt());
        verify(workEvaluationRepository, never()).deleteByTeamIdAndMemberId(anyInt(), anyInt());
        verify(requirementRepository, never()).resetStudentInRequirements(anyInt(), anyInt());
        verify(teamMemberRepository, never()).save(any(TeamMember.class));
    }

    @Test
    public void updateTeamMember_memberNotInNewTeamClass() {
        Integer newTeamId = 2;
        Integer memberId = 1;

        UpdateTeamMemberRequest request = new UpdateTeamMemberRequest();
        request.setOldTeamId(null);
        request.setNewTeamId(newTeamId);
        request.setMemberId(memberId);

        // Mock new team with no classes or classes without the member
        newTeam.setClasses(new Classes());  // Empty classes
        when(teamRepository.findById(newTeamId)).thenReturn(Optional.of(newTeam));

        // Expect exception when member is not found in new team class
        assertThrows(NullPointerException.class, () -> teamMemberService.updateTeamMember(request));

        // Verify that no other methods are called
        verify(studentEvaluationRepository, never()).deleteByMilestoneIdAndMemberId(anyInt(), anyInt());
        verify(updateTrackingRepository, never()).deleteByTeamIdAndMemberId(anyInt(), anyInt());
        verify(workEvaluationRepository, never()).deleteByTeamIdAndMemberId(anyInt(), anyInt());
        verify(requirementRepository, never()).resetStudentInRequirements(anyInt(), anyInt());
        verify(teamMemberRepository, never()).save(any(TeamMember.class));
    }
}

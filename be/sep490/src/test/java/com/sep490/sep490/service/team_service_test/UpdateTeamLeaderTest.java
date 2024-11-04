package com.sep490.sep490.service.team_service_test;

import com.sep490.sep490.common.exception.ApiInputException;
import com.sep490.sep490.common.exception.ConflictException;
import com.sep490.sep490.common.exception.RecordNotFoundException;
import com.sep490.sep490.entity.*;
import com.sep490.sep490.repository.TeamRepository;
import com.sep490.sep490.service.TeamService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UpdateTeamLeaderTest {
    @Mock
    private TeamRepository teamRepository;

    @InjectMocks
    private TeamService teamService;

    private Team team;
    private TeamMember teamMember;
    private User leader;

    @BeforeEach
    public void setUp() {
        team = new Team();
        leader = new User();
        leader.setId(1);
        teamMember = new TeamMember();
        teamMember.setMember(leader);
        team.setTeamMembers(List.of(teamMember));
    }

    /*@Test
    public void updateTeamLeader_success() {
        Integer teamId = 1;
        Integer leaderId = 1;

        when(teamRepository.findById(teamId)).thenReturn(Optional.of(team));

        assertDoesNotThrow(() -> teamService.updateTeamLeader(teamId, leaderId));

        assertEquals(leaderId, team.getLeader().getId());
        verify(teamRepository, times(1)).save(team);
    }*/

    @Test
    public void updateTeamLeader_teamNotFound() {
        Integer teamId = 1;
        Integer leaderId = 1;

        when(teamRepository.findById(teamId)).thenReturn(Optional.empty());

        assertThrows(RecordNotFoundException.class, () -> teamService.updateTeamLeader(teamId, leaderId));
    }

    /*@Test
    public void updateTeamLeader_leaderNotInTeam() {
        Integer teamId = 1;
        Integer leaderId = 2; // Leader not in the team

        when(teamRepository.findById(teamId)).thenReturn(Optional.of(team));

        assertThrows(NullPointerException.class, () -> teamService.updateTeamLeader(teamId, leaderId));
    }*/

    @Test
    public void updateTeamLeader_nullTeamId() {
        Integer leaderId = 1;

        assertThrows(ApiInputException.class, () -> teamService.updateTeamLeader(null, leaderId));
    }

    @Test
    public void updateTeamLeader_nullLeaderId() {
        Integer teamId = 1;

        assertThrows(ApiInputException.class, () -> teamService.updateTeamLeader(teamId, null));
    }

}

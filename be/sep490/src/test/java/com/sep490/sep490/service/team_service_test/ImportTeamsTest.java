package com.sep490.sep490.service.team_service_test;

import com.sep490.sep490.dto.team.ImportTeamListRequest;
import com.sep490.sep490.dto.team.ImportTeamRequest;
import com.sep490.sep490.dto.team.request.SearchTeamRequest;
import com.sep490.sep490.entity.*;
import com.sep490.sep490.repository.*;
import com.sep490.sep490.service.TeamService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ImportTeamsTest {
    @Mock
    private MilestoneRepository milestoneRepository;
    @Mock
    private RequirementRepository requirementRepository;
    @Mock
    private TeamMemberRepository teamMemberRepository;
    @Mock
    private TeamRepository teamRepository;
    @Mock
    private UserRepository userRepository; // Add this line
    @InjectMocks
    private TeamService teamService;
    private Milestone milestone;

    @BeforeEach
    public void setUp() {
        milestone = new Milestone();
        milestone.setId(1);

        Classes classes = new Classes();
        classes.setClassesUsers(new ArrayList<>()); // Initialize the classesUsers list
        milestone.setClasses(classes);

        milestone.setTeams(new ArrayList<>()); // Initialize the teams list
    }

    /*@Test
    public void testImportTeams() {
        ImportTeamRequest teamRequest = ImportTeamRequest.builder()
                .teamName("Team A")
                .topicName("Topic A")
                .leaderId(1)
                .memberIds(Arrays.asList(2, 3))
                .build();

        ImportTeamListRequest request = ImportTeamListRequest.builder()
                .milestoneId(1)
                .teams(Arrays.asList(teamRequest))
                .build();

        when(milestoneRepository.findById(any(Integer.class))).thenReturn(Optional.of(milestone));
        when(userRepository.findById(any(Integer.class))).thenReturn(Optional.of(new User()));
        // Mock user repository behavior within the test method
        when(userRepository.findById(any(Integer.class))).thenReturn(Optional.of(new User()));

        Object result = teamService.importTeams(request);

        assertNotNull(result);
        verify(milestoneRepository, times(1)).save(any(Milestone.class));
        verify(teamRepository, times(1)).deleteByMilestoneId(any(Integer.class));
    }*/

    @Test
    public void testDeleteConstraints() {
        Team team = new Team();
        team.setId(1);
        milestone.setTeams(Arrays.asList(team));

        teamService.deleteContraints(milestone);

        verify(requirementRepository, times(1)).deleteByTeamId(1,1);
        verify(teamMemberRepository, times(1)).deleteByTeamId(1);
        verify(teamRepository, times(1)).deleteByMilestoneId(1);
    }

}

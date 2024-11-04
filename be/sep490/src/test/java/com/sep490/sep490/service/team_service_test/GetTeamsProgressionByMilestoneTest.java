package com.sep490.sep490.service.team_service_test;

import com.sep490.sep490.common.exception.RecordNotFoundException;
import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.dto.team.response.ProgressOfTeam;
import com.sep490.sep490.entity.*;
import com.sep490.sep490.repository.MilestoneRepository;
import com.sep490.sep490.service.MilestoneService;
import com.sep490.sep490.service.TeamService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class GetTeamsProgressionByMilestoneTest {
    @Mock
    private MilestoneRepository milestoneRepository;
    @InjectMocks
    private TeamService teamService;
    private Milestone milestone;
    private Team team;
    private Requirement requirement;

    @BeforeEach
    public void setUp() {
        milestone = new Milestone();
        team = new Team();
        team.setId(1);
        team.setTeamName("Team A");

        requirement = new Requirement();
        requirement.setStatus(Constants.RequirementStatus.REQUIREMENT_STATUSES.get(0)); // "TO DO"
        List<Requirement> requirements = new ArrayList<>();
        requirements.add(requirement);
        team.setRequirements(requirements);

        List<Team> teams = new ArrayList<>();
        teams.add(team);
        milestone.setTeams(teams);
    }

    @Test
    public void getTeamsProgressionByMilestone_success() {
        Integer milestoneId = 1;

        when(milestoneRepository.findById(milestoneId)).thenReturn(Optional.of(milestone));

        Object result = teamService.getTeamsProgressionByMilestone(milestoneId);

        assertNotNull(result);
        assertInstanceOf(List.class, result);

        List<ProgressOfTeam> progressOfTeams = (List<ProgressOfTeam>) result;
        assertEquals(1, progressOfTeams.size());

        ProgressOfTeam progressOfTeam = progressOfTeams.get(0);
        assertEquals(1, progressOfTeam.getId());
        assertEquals("Team A", progressOfTeam.getTeamName());

        List<Float> completionProgress = progressOfTeam.getCompletionProgress();
        assertNotNull(completionProgress);
        assertEquals(5, completionProgress.size());
        assertEquals(100.0f, completionProgress.get(1)); // "TO DO"
    }

    @Test
    public void getTeamsProgressionByMilestone_milestoneNotFound() {
        Integer milestoneId = 1;

        when(milestoneRepository.findById(milestoneId)).thenReturn(Optional.empty());

        assertThrows(RecordNotFoundException.class, () -> teamService.getTeamsProgressionByMilestone(milestoneId));
    }

    @Test
    public void getTeamsProgressionByMilestone_noTeams() {
        Integer milestoneId = 1;
        milestone.setTeams(null);

        when(milestoneRepository.findById(milestoneId)).thenReturn(Optional.of(milestone));

        Object result = teamService.getTeamsProgressionByMilestone(milestoneId);

        assertNotNull(result);
        assertInstanceOf(List.class, result);
        List<ProgressOfTeam> progressOfTeams = (List<ProgressOfTeam>) result;
        assertEquals(0, progressOfTeams.size());
    }

    @Test
    public void getTeamsProgressionByMilestone_multipleTeamsWithDifferentRequirements() {
        Integer milestoneId = 1;

        Team teamB = new Team();
        teamB.setId(2);
        teamB.setTeamName("Team B");

        Requirement requirementB1 = new Requirement();
        requirementB1.setStatus(Constants.RequirementStatus.REQUIREMENT_STATUSES.get(1)); // "DOING"
        Requirement requirementB2 = new Requirement();
        requirementB2.setStatus(Constants.RequirementStatus.REQUIREMENT_STATUSES.get(2)); // "SUBMITTED"
        teamB.setRequirements(List.of(requirementB1, requirementB2));

        milestone.setTeams(List.of(team, teamB));

        when(milestoneRepository.findById(milestoneId)).thenReturn(Optional.of(milestone));

        Object result = teamService.getTeamsProgressionByMilestone(milestoneId);

        assertNotNull(result);
        assertInstanceOf(List.class, result);

        List<ProgressOfTeam> progressOfTeams = (List<ProgressOfTeam>) result;
        assertEquals(2, progressOfTeams.size());

        ProgressOfTeam progressOfTeamA = progressOfTeams.get(0);
        assertEquals(1, progressOfTeamA.getId());
        assertEquals("Team A", progressOfTeamA.getTeamName());

        List<Float> completionProgressA = progressOfTeamA.getCompletionProgress();
        assertNotNull(completionProgressA);
        assertEquals(100.0f, completionProgressA.get(1)); // "TO DO"

        ProgressOfTeam progressOfTeamB = progressOfTeams.get(1);
        assertEquals(2, progressOfTeamB.getId());
        assertEquals("Team B", progressOfTeamB.getTeamName());

        List<Float> completionProgressB = progressOfTeamB.getCompletionProgress();
        assertNotNull(completionProgressB);
        assertEquals(50.0f, completionProgressB.get(2)); // "DOING"
        assertEquals(50.0f, completionProgressB.get(3)); // "SUBMITTED"
    }

    @Test
    public void getTeamsProgressionByMilestone_allRequirementStatuses() {
        Integer milestoneId = 1;

        Requirement requirementToDo = new Requirement();
        requirementToDo.setStatus(Constants.RequirementStatus.REQUIREMENT_STATUSES.get(0)); // "TO DO"
        Requirement requirementDoing = new Requirement();
        requirementDoing.setStatus(Constants.RequirementStatus.REQUIREMENT_STATUSES.get(1)); // "DOING"
        Requirement requirementSubmitted = new Requirement();
        requirementSubmitted.setStatus(Constants.RequirementStatus.REQUIREMENT_STATUSES.get(2)); // "SUBMITTED"
        Requirement requirementEvaluated = new Requirement();
        requirementEvaluated.setStatus(Constants.RequirementStatus.REQUIREMENT_STATUSES.get(3)); // "EVALUATED"
        Requirement requirementWaiting = new Requirement();
        requirementWaiting.setStatus(Constants.RequirementStatus.REQUIREMENT_STATUSES.get(4)); // "WAITING FOR APPROVAL"

        team.setRequirements(List.of(requirementToDo, requirementDoing, requirementSubmitted, requirementEvaluated, requirementWaiting));
        milestone.setTeams(List.of(team));

        when(milestoneRepository.findById(milestoneId)).thenReturn(Optional.of(milestone));

        Object result = teamService.getTeamsProgressionByMilestone(milestoneId);

        assertNotNull(result);
        assertInstanceOf(List.class, result);

        List<ProgressOfTeam> progressOfTeams = (List<ProgressOfTeam>) result;
        assertEquals(1, progressOfTeams.size());

        ProgressOfTeam progressOfTeam = progressOfTeams.get(0);
        assertEquals(1, progressOfTeam.getId());
        assertEquals("Team A", progressOfTeam.getTeamName());

        List<Float> completionProgress = progressOfTeam.getCompletionProgress();
        assertNotNull(completionProgress);
        assertEquals(20.0f, completionProgress.get(0)); // "WAITING FOR APPROVAL"
        assertEquals(20.0f, completionProgress.get(1)); // "TO DO"
        assertEquals(20.0f, completionProgress.get(2)); // "DOING"
        assertEquals(20.0f, completionProgress.get(3)); // "SUBMITTED"
        assertEquals(20.0f, completionProgress.get(4)); // "EVALUATED"
    }
}

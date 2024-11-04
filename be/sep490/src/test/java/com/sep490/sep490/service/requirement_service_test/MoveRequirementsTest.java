package com.sep490.sep490.service.requirement_service_test;

import com.sep490.sep490.common.exception.ConflictException;
import com.sep490.sep490.common.exception.NameAlreadyExistsException;
import com.sep490.sep490.common.exception.RecordNotFoundException;
import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.dto.requirement.request.*;
import com.sep490.sep490.entity.*;
import com.sep490.sep490.repository.*;
import com.sep490.sep490.service.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MoveRequirementsTest {
    @Mock
    private RequirementRepository requirementRepository;

    @Mock
    private MilestoneRepository milestoneRepository;

    @Mock
    private TeamRepository teamRepository;

    @InjectMocks
    private RequirementService requirementService;

    private MoveRequirementRequest request;

    @BeforeEach
    void setUp() {
        // Initialize the request with valid test data
        request = new MoveRequirementRequest(
                2, // milestoneId
                List.of(1), // requirementIds
                List.of(2) // teamIds
        );

    }

    @Test
    void testMoveRequirements_Successful() {
        // Set up mock behavior
        Milestone milestone = new Milestone();
        milestone.setId(1);

        Milestone milestone2 = new Milestone();
        milestone2.setId(2);

        Requirement requirement = new Requirement();
        requirement.setId(1);
        requirement.setReqTitle("req1");
        requirement.setStatus(Constants.RequirementStatus.REQUIREMENT_STATUSES.get(0));
        requirement.setMilestone(milestone);

        Team team1 = new Team();
        team1.setId(1);
        team1.setRequirements(List.of(requirement));
        team1.setTeamName("Team A");

        Team team2 = new Team();
        team2.setId(2);
        team2.setTeamName("Team B");

        // Mock responses
        when(milestoneRepository.findById(anyInt())).thenReturn(Optional.of(milestone2));
        when(teamRepository.findById(anyInt())).thenReturn(Optional.of(team2));
        when(requirementRepository.findById(anyInt())).thenReturn(Optional.of(requirement));
        when(requirementRepository.checkExistedByTitleInMilestone(milestone2.getId(), requirement.getReqTitle().toLowerCase()))
                .thenReturn(null);

        when(requirementRepository.checkExistedByTitle(isNull(), anyInt(), anyString()))
                .thenReturn(null);

        // Call the method
        Object result = requirementService.moveRequirements(request);

        // Verify interactions with teamRepository
        verify(teamRepository, times(request.getTeamIds().size())).findById(anyInt());

        // Verify other interactions
        verify(requirementRepository, times(1)).deleteAllByIds(anyList());
        verify(requirementRepository, times(1)).saveAll(anyList());

        assertNotNull(result);
    }

    @Test
    void testMoveRequirements_RequirementNotFound() {
        // Set up mock behavior
        Milestone milestone = new Milestone();
        milestone.setId(1);

        Milestone milestone2 = new Milestone();
        milestone2.setId(2);

        Team team2 = new Team();
        team2.setId(2);
        team2.setTeamName("Team B");

        when(milestoneRepository.findById(anyInt())).thenReturn(Optional.of(milestone2));
        when(teamRepository.findById(anyInt())).thenReturn(Optional.of(team2));
        when(requirementRepository.findById(anyInt())).thenThrow(new RecordNotFoundException("Requirement not found"));

        assertThrows(RecordNotFoundException.class, () -> {
            requirementService.moveRequirements(request);
        });
    }


    @Test
    void testMoveRequirements_MilestoneNotFound() {
        when(milestoneRepository.findById(anyInt())).thenThrow(new RecordNotFoundException("Milestone not found"));

        assertThrows(RecordNotFoundException.class, () -> {
            requirementService.moveRequirements(request);
        });
    }

    @Test
    void testMoveRequirements_RequirementAlreadyEvaluated() {
        // Set up mock behavior
        Milestone milestone = new Milestone();
        milestone.setId(1);

        Milestone milestone2 = new Milestone();
        milestone2.setId(2);

        Team team2 = new Team();
        team2.setId(2);
        team2.setTeamName("Team B");

        Requirement evaluatedRequirement = new Requirement();
        evaluatedRequirement.setId(1); // Ensure ID matches the request
        evaluatedRequirement.setStatus(Constants.RequirementStatus.REQUIREMENT_STATUSES.get(3)); // "EVALUATED"

        when(milestoneRepository.findById(anyInt())).thenReturn(Optional.of(milestone2));
        when(teamRepository.findById(anyInt())).thenReturn(Optional.of(team2));
        when(requirementRepository.findById(anyInt())).thenReturn(Optional.of(evaluatedRequirement));

        // Assert that a ConflictException is thrown
        assertThrows(ConflictException.class, () -> {
            requirementService.moveRequirements(request);
        });
    }

}

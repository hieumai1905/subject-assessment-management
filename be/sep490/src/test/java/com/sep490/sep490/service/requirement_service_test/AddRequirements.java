package com.sep490.sep490.service.requirement_service_test;

import com.sep490.sep490.common.exception.ApiInputException;
import com.sep490.sep490.common.exception.NameAlreadyExistsException;
import com.sep490.sep490.common.exception.RecordNotFoundException;
import com.sep490.sep490.dto.RequirementDTO;
import com.sep490.sep490.dto.requirement.request.AddRequirementList;
import com.sep490.sep490.entity.*;
import com.sep490.sep490.repository.*;
import com.sep490.sep490.service.CommonService;
import com.sep490.sep490.service.RequirementService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class AddRequirements {
    @Mock
    private MilestoneRepository milestoneRepository;

    @Mock
    private TeamRepository teamRepository;

    @Mock
    private RequirementRepository requirementRepository;

    @Mock
    private CommonService commonService;

    @Mock
    private SettingRepository settingRepository;

    @InjectMocks
    private RequirementService requirementService;

    private AddRequirementList request;
    private RequirementDTO requirementDTO;
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        // Prepare a sample RequirementDTO
        requirementDTO = new RequirementDTO();
        requirementDTO.setReqTitle("Sample Requirement");
        requirementDTO.setTeamIds(Arrays.asList(1, 2));
        requirementDTO.setMilestoneId(1);
        requirementDTO.setComplexityId(1);
        requirementDTO.setStatus("TO DO");

        // Prepare a sample AddRequirementList
        request = new AddRequirementList();
        request.setMilestoneId(1);
        request.setTeamIds(Arrays.asList(1, 2));
        request.setRequirementDTOs(Arrays.asList(requirementDTO));
    }

    @Test
    void testAddRequirementsSuccess() {
        Milestone milestone = new Milestone();
        milestone.setId(1);
        when(milestoneRepository.findById(1)).thenReturn(Optional.of(milestone));

        Team team1 = new Team();
        team1.setId(1);
        Team team2 = new Team();
        team2.setId(2);
        when(teamRepository.findById(1)).thenReturn(Optional.of(team1));
        when(teamRepository.findById(2)).thenReturn(Optional.of(team2));

        Requirement requirement = new Requirement();
        when(requirementRepository.saveAll(any())).thenReturn(Arrays.asList(requirement));

        Setting complexity = new Setting();
        complexity.setId(1);
        when(settingRepository.findSettingBySettingTypeAndSettingId("complexity", 1))
                .thenReturn(complexity);

        List<RequirementDTO> response = (List<RequirementDTO>) requirementService.addRequirements(request);

        assertNotNull(response);
        verify(milestoneRepository, times(1)).findById(1);
        verify(teamRepository, times(1)).findById(1);
        verify(teamRepository, times(1)).findById(2);
        verify(requirementRepository, times(1)).saveAll(any());
    }

    @Test
    void testAddRequirementsMilestoneNotFound() {

        Team team1 = new Team();
        team1.setId(1);
        Team team2 = new Team();
        team2.setId(2);
        when(teamRepository.findById(1)).thenReturn(Optional.of(team1));
        when(teamRepository.findById(2)).thenReturn(Optional.of(team2));

        when(milestoneRepository.findById(1)).thenReturn(Optional.empty());

        RecordNotFoundException exception = assertThrows(RecordNotFoundException.class,
                () -> requirementService.addRequirements(request));

        assertEquals("Milestone not found!", exception.getMessage());
    }

    @Test
    void testAddRequirementsTeamNotFound() {
        Milestone milestone = new Milestone();
        milestone.setId(1);
        when(milestoneRepository.findById(1)).thenReturn(Optional.of(milestone));
        when(teamRepository.findById(1)).thenReturn(Optional.empty());

        RecordNotFoundException exception = assertThrows(RecordNotFoundException.class,
                () -> requirementService.addRequirements(request));

        assertEquals("Team not found!", exception.getMessage());
    }

    @Test
    void testCreateRequirementNameAlreadyExists() {
        RequirementDTO requirementDTO = new RequirementDTO();
        requirementDTO.setReqTitle("Requirement 1");
        requirementDTO.setTeamIds(Arrays.asList(1));
        requirementDTO.setMilestoneId(1);

        Milestone milestone = new Milestone();
        milestone.setId(1);
        when(milestoneRepository.findById(1)).thenReturn(Optional.of(milestone));

        Team team = new Team();
        team.setId(1);
        when(teamRepository.findById(1)).thenReturn(Optional.of(team));

        Requirement existingRequirement = new Requirement();
        when(requirementRepository.checkExistedByTitle(null, 1, "Requirement 1"))
                .thenReturn(existingRequirement);

        NameAlreadyExistsException exception = assertThrows(NameAlreadyExistsException.class,
                () -> requirementService.create(requirementDTO, milestone, Arrays.asList(team), false));

        assertEquals("Requirement 1 in null is already existed!", exception.getMessage());
    }

}

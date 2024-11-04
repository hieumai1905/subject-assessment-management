package com.sep490.sep490.service.submission_test;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.sep490.sep490.common.exception.ApiInputException;
import com.sep490.sep490.common.exception.ConflictException;
import com.sep490.sep490.common.exception.RecordNotFoundException;
import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.dto.requirement.request.SubmitRequirementRequest;
import com.sep490.sep490.entity.*;
import com.sep490.sep490.mapper.SubmissionMapper;
import com.sep490.sep490.repository.*;
import com.sep490.sep490.service.CommonService;
import com.sep490.sep490.service.FirebaseStorageService;
import com.sep490.sep490.service.RequirementService;
import com.sep490.sep490.service.SubmissionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@ExtendWith(MockitoExtension.class)
public class SubmissionServiceTest {

    @Mock
    private TeamRepository teamRepository;

    @Mock
    private MilestoneRepository milestoneRepository;

    @Mock
    private SubmissionRepository submissionRepository;

    @Mock
    private RequirementRepository requirementRepository;
    @Mock
    private TeamEvaluationRepository teamEvaluationRepository;

    @Mock
    private SubmissionMapper submissionMapper;

    @Mock
    private CommonService commonService;

    @Mock
    private FirebaseStorageService firebaseStorageService;

    @InjectMocks
    private RequirementService requirementService;

    private SubmitRequirementRequest request;
    private MultipartFile file;
    private User currentUser;
    private Team team;
    private Milestone milestone;
    private Submission submission;
    private Requirement requirement;

    @BeforeEach
    void setUp() {
        request = new SubmitRequirementRequest();
        request.setTeamId(1);
        request.setMilestoneId(1);
        request.setLink("test_link");
        request.setNote("test_note");
        request.setRequirementIds(Arrays.asList(1));
        request.setAssigneeIds(Arrays.asList(1));

        file = mock(MultipartFile.class);
        currentUser = new User();
        currentUser.setId(1);
        currentUser.setEmail("test@example.com");

        team = new Team();
        team.setId(1);
        team.setLeader(new User());
        team.getLeader().setId(1);

        milestone = new Milestone();
        milestone.setId(1);
        milestone.setActive(true);
        milestone.setTitle("Milestone 1");
        milestone.setDueDate(new Date());
        milestone.setTypeEvaluator(Constants.TypeAssignments.NORMAL);

        submission = new Submission();
        submission.setId(1);
        submission.setTeamId(1);
        submission.setMilestoneId(1);

        requirement = new Requirement();
        requirement.setId(1);
        requirement.setMilestone(milestone);
        requirement.setStatus(Constants.RequirementStatus.REQUIREMENT_STATUSES.get(0));
    }

    @Test
    void testSubmitWork_Success_NewSubmission() {
        when(commonService.getCurrentUser()).thenReturn(currentUser);
        when(teamRepository.findByLeaderAndTeamId(1, 1)).thenReturn(team);
        // Ensure milestone is returned correctly
        when(milestoneRepository.findById(1)).thenReturn(Optional.of(milestone));
        when(firebaseStorageService.uploadFile(file)).thenReturn("file_url");
        when(submissionRepository.findByTeamIdAndMilestoneId(1, 1)).thenReturn(null);
        when(requirementRepository.findById(1)).thenReturn(Optional.of(requirement));

        Object result = requirementService.submitWork(request, file);

        assertEquals("Submit successfully!", result);
        verify(submissionRepository, times(1)).save(any(Submission.class));
        verify(requirementRepository, times(1)).saveAll(anyList());
    }

    @Test
    void testSubmitWork_Success_UpdateSubmission() {
        when(commonService.getCurrentUser()).thenReturn(currentUser);
        when(teamRepository.findByLeaderAndTeamId(1, 1)).thenReturn(team);
        // Ensure milestone is returned correctly
        when(milestoneRepository.findById(1)).thenReturn(Optional.of(milestone));
        when(firebaseStorageService.uploadFile(file)).thenReturn("file_url");
        when(submissionRepository.findByTeamIdAndMilestoneId(1, 1)).thenReturn(submission);
        when(requirementRepository.findById(1)).thenReturn(Optional.of(requirement));
        when(requirementRepository.findAllBySubmissionId(1)).thenReturn(Collections.singletonList(requirement));

        Object result = requirementService.submitWork(request, file);

        assertEquals("Submit successfully!", result);
        verify(submissionRepository, times(1)).save(any(Submission.class));
        verify(requirementRepository, times(1)).saveAll(anyList());
    }

    @Test
    void testSubmitWork_ThrowConflictException_NotLeader() {
        when(commonService.getCurrentUser()).thenReturn(currentUser);
        when(teamRepository.findByLeaderAndTeamId(1, 1)).thenReturn(null);

        assertThrows(ConflictException.class, () -> {
            requirementService.submitWork(request, file);
        });
    }

    @Test
    void testSubmitWork_ThrowRecordNotFoundException_MilestoneNotFound() {
        when(commonService.getCurrentUser()).thenReturn(currentUser);
        when(teamRepository.findByLeaderAndTeamId(1, 1)).thenReturn(team);
        when(milestoneRepository.findById(1)).thenReturn(Optional.empty());

        assertThrows(RecordNotFoundException.class, () -> {
            requirementService.submitWork(request, file);
        });
    }

    @Test
    void testSubmitWork_ThrowConflictException_MilestoneLocked() {
        milestone.setActive(false);
        when(commonService.getCurrentUser()).thenReturn(currentUser);
        when(teamRepository.findByLeaderAndTeamId(1, 1)).thenReturn(team);
        when(milestoneRepository.findById(1)).thenReturn(Optional.of(milestone));

        assertThrows(ConflictException.class, () -> {
            requirementService.submitWork(request, file);
        });
    }

    @Test
    void testValidateInput_ThrowApiInputException_RequirementIdsMissing() {
        request.setRequirementIds(null);

        assertThrows(ApiInputException.class, () -> {
            request.validateInput(file, false);
        });
    }

    @Test
    void testValidateInput_ThrowApiInputException_AssigneeIdsMissing() {
        request.setAssigneeIds(null);

        assertThrows(ApiInputException.class, () -> {
            request.validateInput(file, false);
        });
    }

    @Test
    void testValidateInput_ThrowApiInputException_RequirementAndAssigneeSizeMismatch() {
        request.setRequirementIds(Arrays.asList(1, 2));
        request.setAssigneeIds(Arrays.asList(1));

        assertThrows(ApiInputException.class, () -> {
            request.validateInput(file, false);
        });
    }
}

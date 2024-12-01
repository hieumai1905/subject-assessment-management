package com.sep490.sep490.service.evaluation_test;

import com.sep490.sep490.common.exception.ApiInputException;
import com.sep490.sep490.common.exception.ConflictException;
import com.sep490.sep490.common.exception.RecordNotFoundException;
import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.dto.evaluation.request.EvaluateStudentForGrandFinal;
import com.sep490.sep490.dto.studentEvaluation.request.StudentEvalRequest;
import com.sep490.sep490.entity.*;
import com.sep490.sep490.repository.*;
import com.sep490.sep490.service.CommonService;
import com.sep490.sep490.service.StudentEvaluationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EvaluationServiceTest {

    @Mock
    private TeamRepository teamRepository;

    @Mock
    private SessionRepository sessionRepository;

    @Mock
    private CouncilTeamRepository councilTeamRepository;

    @Mock
    private StudentEvaluationRepository studentEvaluationRepository;

    @Mock
    private TeamEvaluationRepository teamEvaluationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CommonService commonService;

    @InjectMocks
    private StudentEvaluationService evaluationService;

    private EvaluateStudentForGrandFinal request;
    private Team team;
    private Session session;
    private CouncilTeam councilTeam;
    private Milestone milestone;
    private User evaluator;
    private StudentEvalRequest studentEvalRequest;

    @BeforeEach
    void setUp() {
        request = new EvaluateStudentForGrandFinal();
        request.setTeamId(1);
        request.setSessionId(1);
        studentEvalRequest = new StudentEvalRequest();
        studentEvalRequest.setEmail("student@example.com");
        studentEvalRequest.setEvalGrade(9.5f);
        request.setStudentEvals(Collections.singletonList(studentEvalRequest));

        milestone = new Milestone();
        milestone.setEvaluationType(Constants.TypeAssignments.GRAND_FINAL);
        milestone.setMilestoneCriteriaList(new ArrayList<>());

        team = new Team();
        team.setId(1);
        Classes classes = new Classes();
        classes.setMilestones(List.of(milestone));
        team.setClasses(classes);

        session = new Session();
        session.setId(1);

        councilTeam = new CouncilTeam();
        councilTeam.setId(1);

        evaluator = new User();
        evaluator.setId(1);
    }

    @Test
    void testEvaluateStudentForGrandFinal_Success() {
        when(commonService.getCurrentUser()).thenReturn(evaluator);
        when(teamRepository.findById(anyInt())).thenReturn(Optional.of(team));
        when(sessionRepository.findById(anyInt())).thenReturn(Optional.of(session));
        when(councilTeamRepository.findByTeamIdAndSessionId(anyInt(), anyInt())).thenReturn(councilTeam);
        when(teamRepository.findById(anyInt())).thenReturn(Optional.of(team));

        Milestone finalMilestone = new Milestone();
        finalMilestone.setEvaluationType(Constants.TypeAssignments.GRAND_FINAL);
        finalMilestone.setMilestoneCriteriaList(new ArrayList<>());

        Object result = evaluationService.evaluateStudentForGrandFinal(request);

        assertEquals("Evaluate successfully!", result);
        verify(studentEvaluationRepository, times(1)).saveAll(anyList());
        verify(teamEvaluationRepository, times(1)).saveAll(anyList());
    }

    @Test
    void testEvaluateStudentForGrandFinal_NoDataToEvaluate() {
        request.setStudentEvals(Collections.emptyList());

        Object result = evaluationService.evaluateStudentForGrandFinal(request);

        assertEquals("No data to evaluate!", result);
        verify(studentEvaluationRepository, times(0)).saveAll(anyList());
        verify(teamEvaluationRepository, times(0)).saveAll(anyList());
    }

    @Test
    void testEvaluateStudentForGrandFinal_ThrowRecordNotFoundException_TeamNotFound() {
        when(teamRepository.findById(anyInt())).thenReturn(Optional.empty());

        assertThrows(RecordNotFoundException.class, () -> {
            evaluationService.evaluateStudentForGrandFinal(request);
        });
    }

    @Test
    void testEvaluateStudentForGrandFinal_ThrowRecordNotFoundException_SessionNotFound() {
        when(teamRepository.findById(anyInt())).thenReturn(Optional.of(team));
        when(sessionRepository.findById(anyInt())).thenReturn(Optional.empty());

        assertThrows(RecordNotFoundException.class, () -> {
            evaluationService.evaluateStudentForGrandFinal(request);
        });
    }

    @Test
    void testEvaluateStudentForGrandFinal_ThrowConflictException_NoCouncilTeam() {
        when(teamRepository.findById(anyInt())).thenReturn(Optional.of(team));
        when(sessionRepository.findById(anyInt())).thenReturn(Optional.of(session));
        when(councilTeamRepository.findByTeamIdAndSessionId(anyInt(), anyInt())).thenReturn(null);

        assertThrows(ConflictException.class, () -> {
            evaluationService.evaluateStudentForGrandFinal(request);
        });
    }

    @Test
    void testEvaluateStudentForGrandFinal_ThrowApiInputException_GradeOutOfRange() {
        when(commonService.getCurrentUser()).thenReturn(evaluator);
        when(teamRepository.findById(anyInt())).thenReturn(Optional.of(team));
        when(sessionRepository.findById(anyInt())).thenReturn(Optional.of(session));
        when(councilTeamRepository.findByTeamIdAndSessionId(anyInt(), anyInt())).thenReturn(councilTeam);
        when(teamRepository.findById(anyInt())).thenReturn(Optional.of(team));

        Milestone finalMilestone = new Milestone();
        finalMilestone.setEvaluationType(Constants.TypeAssignments.GRAND_FINAL);
        finalMilestone.setMilestoneCriteriaList(new ArrayList<>());
        studentEvalRequest.setEvalGrade(11f);

        assertThrows(ApiInputException.class, () -> {
            evaluationService.evaluateStudentForGrandFinal(request);
        });

        studentEvalRequest.setEvalGrade(-1f);

        assertThrows(ApiInputException.class, () -> {
            evaluationService.evaluateStudentForGrandFinal(request);
        });
    }

    @Test
    void testEvaluateStudentForGrandFinal_ThrowApiInputException_CommentTooLong() {
        when(commonService.getCurrentUser()).thenReturn(evaluator);
        when(teamRepository.findById(anyInt())).thenReturn(Optional.of(team));
        when(sessionRepository.findById(anyInt())).thenReturn(Optional.of(session));
        when(councilTeamRepository.findByTeamIdAndSessionId(anyInt(), anyInt())).thenReturn(councilTeam);
        when(teamRepository.findById(anyInt())).thenReturn(Optional.of(team));

        Milestone finalMilestone = new Milestone();
        finalMilestone.setEvaluationType(Constants.TypeAssignments.GRAND_FINAL);
        finalMilestone.setMilestoneCriteriaList(new ArrayList<>());
        String longComment = "a".repeat(751);
        studentEvalRequest.setComment(longComment);

        assertThrows(ApiInputException.class, () -> {
            evaluationService.evaluateStudentForGrandFinal(request);
        });
    }

}


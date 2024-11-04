package com.sep490.sep490.service.evaluation_test;

import com.sep490.sep490.common.exception.ApiInputException;
import com.sep490.sep490.common.exception.ConflictException;
import com.sep490.sep490.common.exception.RecordNotFoundException;
import com.sep490.sep490.dto.work_evaluation.request.EvaluateRequirementRequest;
import com.sep490.sep490.entity.*;
import com.sep490.sep490.repository.*;
import com.sep490.sep490.service.WorkEvaluationService;
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
public class WorkEvaluationServiceTest {

    @Mock
    private WorkEvaluationRepository workEvaluationRepository;

    @Mock
    private RequirementRepository requirementRepository;

    @Mock
    private StudentEvaluationRepository studentEvaluationRepository;

    @Mock
    private MilestoneRepository milestoneRepository;

    @Mock
    private SettingRepository settingRepository;

    @InjectMocks
    private WorkEvaluationService evaluationService;

    private EvaluateRequirementRequest evalRequest;
    private Milestone milestone;
    private Requirement requirement;
    private Setting complexity;
    private Setting quality;
    private User student;

    @BeforeEach
    void setUp() {
        evalRequest = new EvaluateRequirementRequest();
        evalRequest.setReqId(1);
        evalRequest.setComplexityId(2);
        evalRequest.setQualityId(3);
        evalRequest.setGrade(8.5f);
        evalRequest.setComment("Good work");

        milestone = new Milestone();
        milestone.setId(1);
        milestone.setExpectedLoc(100);
        List<MilestoneCriteria> criteria = new ArrayList<>();
        MilestoneCriteria milestoneCriteria = new MilestoneCriteria();
        milestoneCriteria.setId(1);
        milestoneCriteria.setLocEvaluation(true);
        milestoneCriteria.setEvalWeight(70);
        criteria.add(milestoneCriteria);
        milestone.setMilestoneCriteriaList(criteria);

        student = new User();
        student.setId(1);

        requirement = new Requirement();
        requirement.setId(1);
        requirement.setStudent(student);

        complexity = new Setting();
        complexity.setId(2);
        complexity.setSettingType("Complexity");

        quality = new Setting();
        quality.setId(3);
        quality.setSettingType("Quality");


    }

    @Test
    void testEvaluateRequirement_Success() {
        when(milestoneRepository.findById(1)).thenReturn(Optional.of(milestone));
        when(settingRepository.findSettingBySettingTypeAndSettingId("complexity", 2))
                .thenReturn(complexity);
        when(settingRepository.findSettingBySettingTypeAndSettingId("quality", 3))
                .thenReturn(quality);
        when(requirementRepository.findById(anyInt())).thenReturn(Optional.of(requirement));
        when(workEvaluationRepository.saveAll(anyList())).thenReturn(new ArrayList<>());
        when(studentEvaluationRepository.saveAll(anyList())).thenReturn(new ArrayList<>());

        Object result = evaluationService.evaluateRequirement(1, Arrays.asList(evalRequest));

        assertEquals("Evaluate successfully!", result);
        verify(workEvaluationRepository, times(1)).saveAll(anyList());
        verify(requirementRepository, times(1)).saveAll(anyList());
        verify(studentEvaluationRepository, times(1)).saveAll(anyList());
    }


    @Test
    void testEvaluateRequirement_NoDataToEvaluate() {
        Object result = evaluationService.evaluateRequirement(1, new ArrayList<>());

        assertEquals("No data to evaluate!", result);
        verify(workEvaluationRepository, times(0)).saveAll(anyList());
        verify(requirementRepository, times(0)).saveAll(anyList());
        verify(studentEvaluationRepository, times(0)).saveAll(anyList());
    }

    @Test
    void testEvaluateRequirement_ThrowApiInputException_GradeNegative() {
        evalRequest.setGrade(-1f);

        assertThrows(ApiInputException.class, () -> {
            evalRequest.validateInput();
        });
    }

    @Test
    void testEvaluateRequirement_MilestoneNotFound() {
        when(milestoneRepository.findById(1)).thenReturn(Optional.empty());

        assertThrows(RecordNotFoundException.class, () -> {
            evaluationService.evaluateRequirement(1, Arrays.asList(evalRequest));
        });
    }

    @Test
    void testEvaluateRequirement_ThrowApiInputException_RequirementIdMissing() {
        evalRequest.setReqId(null);

        assertThrows(ApiInputException.class, () -> {
            evalRequest.validateInput();
        });
    }

    @Test
    void testCheckExistStudent_ThrowConflictException_WhenStudentIsNull() {
        requirement.setStudent(null);
        when(milestoneRepository.findById(1)).thenReturn(Optional.of(milestone));
        when(settingRepository.findSettingBySettingTypeAndSettingId("complexity", 2))
                .thenReturn(complexity);

        when(settingRepository.findSettingBySettingTypeAndSettingId("quality", 3))
                .thenReturn(quality);
        when(requirementRepository.findById(anyInt())).thenReturn(Optional.of(requirement));
        ConflictException thrown = assertThrows(ConflictException.class, () -> {
            evaluationService.evaluateRequirement(1, Arrays.asList(evalRequest));
        });

        assertEquals("The requirement must have assignee to evaluate!", thrown.getMessage());
    }

    @Test
    void testCheckExistSetting_ThrowRecordNotFoundException_WhenRequirementNotFound() {
        when(milestoneRepository.findById(1)).thenReturn(Optional.of(milestone));
        when(requirementRepository.findById(anyInt())).thenReturn(Optional.empty());

        RecordNotFoundException thrown = assertThrows(RecordNotFoundException.class, () -> {
            evaluationService.evaluateRequirement(1, Arrays.asList(evalRequest));
        });

        assertEquals("Requirement not found!", thrown.getMessage());
    }

    @Test
    void testCheckExistSetting_ThrowRecordNotFoundException_WhenComplexityNotFound() {
        when(requirementRepository.findById(anyInt())).thenReturn(Optional.of(requirement));
        when(milestoneRepository.findById(1)).thenReturn(Optional.of(milestone));
        when(settingRepository.findSettingBySettingTypeAndSettingId("complexity", 2)).thenReturn(null);

        RecordNotFoundException thrown = assertThrows(RecordNotFoundException.class, () -> {
            evaluationService.evaluateRequirement(1, Arrays.asList(evalRequest));
        });

        // Kiểm tra thông báo lỗi
        assertEquals("complexity not found!", thrown.getMessage());
    }

    @Test
    void testCheckExistSetting_ThrowRecordNotFoundException_WhenQualityNotFound() {
        when(milestoneRepository.findById(1)).thenReturn(Optional.of(milestone));
        when(requirementRepository.findById(anyInt())).thenReturn(Optional.of(requirement));
        when(settingRepository.findSettingBySettingTypeAndSettingId("complexity", 2))
                .thenReturn(complexity);
        when(settingRepository.findSettingBySettingTypeAndSettingId("quality", 3)).thenReturn(null);

        RecordNotFoundException thrown = assertThrows(RecordNotFoundException.class, () -> {
            evaluationService.evaluateRequirement(1, Arrays.asList(evalRequest));
        });

        assertEquals("quality not found!", thrown.getMessage());
    }

}

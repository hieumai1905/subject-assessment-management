package com.sep490.sep490.service.class_service_test;

import com.sep490.sep490.common.exception.ConflictException;
import com.sep490.sep490.dto.ClassUserSuccessDTO;
import com.sep490.sep490.dto.classes.request.DeleteClassStudentDTO;
import com.sep490.sep490.entity.*;
import com.sep490.sep490.repository.*;
import com.sep490.sep490.service.ClassService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DeleteStudent {
    @Mock
    private ClassesRepository classesRepository;
    @Mock
    private StudentEvaluationRepository studentEvaluationRepository;
    @Mock
    private UpdateTrackingRepository updateTrackingRepository;
    @Mock
    private WorkEvaluationRepository workEvaluationRepository;
    @Mock
    private RequirementRepository requirementRepository;
    @Mock
    private TeamMemberRepository teamMemberRepository;
    @Mock
    private ClassesUserRepository classUserRepository;
    @InjectMocks
    private ClassService classService;
    private DeleteClassStudentDTO deleteClassStudentDTO;
    private ClassUser classUser;
    private Classes classes;
    private User user;
    @BeforeEach
    public void setUp() {
        deleteClassStudentDTO = new DeleteClassStudentDTO();
        deleteClassStudentDTO.setStudentId(1);
        deleteClassStudentDTO.setClassId(1);

        classes = Classes.builder().id(1).classCode("PRM123").build();
        user = User.builder().id(1).email("toan@gmail.com").build();

        classUser = new ClassUser();
        classUser.setId(1);
        classUser.setClasses(classes);
        classUser.setUser(user);
    }

    @Test
    public void testDeleteStudent_Success(){
        when(classesRepository.findById(anyInt())).thenReturn(Optional.of(classes));
        when(classUserRepository.findByClassIdAndUserId(1, 1)).thenReturn(classUser);

        ClassUserSuccessDTO result = classService.deleteStudent(deleteClassStudentDTO);

        assertNotNull(result);
        assertEquals(deleteClassStudentDTO.getClassId(), result.getClassesId());
        assertEquals(deleteClassStudentDTO.getStudentId(), result.getUserId());

        // Verify that relevant repository delete method was called
        verify(classUserRepository, times(1)).deleteByClassIdAndUserId(anyInt(), anyInt());

        // Verify that no other methods were called on other repositories
        verifyNoInteractions(studentEvaluationRepository, updateTrackingRepository,
                workEvaluationRepository, requirementRepository, teamMemberRepository);
    }

    @Test
    public void testDeleteStudent_StudentNotInClass() {
        when(classUserRepository.findByClassIdAndUserId(anyInt(), anyInt())).thenReturn(null);

        ConflictException exception = assertThrows(ConflictException.class,
                () -> classService.deleteStudent(deleteClassStudentDTO));

        assertEquals("Student not learn in this class", exception.getMessage());

        verify(studentEvaluationRepository, never()).deleteByMilestoneIdAndMemberId(anyInt(), anyInt());
        verify(updateTrackingRepository, never()).deleteByTeamIdAndMemberId(anyInt(), anyInt());
        verify(workEvaluationRepository, never()).deleteByTeamIdAndMemberId(anyInt(), anyInt());
        verify(requirementRepository, never()).resetStudentInRequirements(anyInt(), anyInt());
        verify(classUserRepository, never()).deleteByClassIdAndUserId(anyInt(), anyInt());
    }
}

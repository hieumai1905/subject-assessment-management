package com.sep490.sep490.service.assignment_service_test;

import com.sep490.sep490.common.exception.ApiInputException;
import com.sep490.sep490.common.exception.RecordNotFoundException;
import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.dto.AssignmentDTO;
import com.sep490.sep490.dto.assignment.request.AssignmentRequest;
import com.sep490.sep490.dto.assignment.request.CreateAssignmentRequest;
import com.sep490.sep490.entity.Assignment;
import com.sep490.sep490.entity.Subject;
import com.sep490.sep490.repository.AssignmentRepository;
import com.sep490.sep490.repository.SubjectRepository;
import com.sep490.sep490.service.AssignmentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AssignmentServiceTest {

    @Mock
    private SubjectRepository subjectRepository;

    @Mock
    private AssignmentRepository assignmentRepository;

    @InjectMocks
    private AssignmentService assignmentService;

    CreateAssignmentRequest request = new CreateAssignmentRequest();

    // 1. Khởi tạo (Instantiate) các Mock Objects:
    // 2. Tiêm (Inject) các Mock Objects:
    @BeforeEach
    void setUp() {
        request.setSubjectId(1);
        request.setAssignmentList(List.of(
                AssignmentRequest.builder().id(1).title("Asm 1")
                        .typeEvaluator(Constants.TypeAssignments.NORMAL).evalWeight(50).expectedLoc(50).build(),
                AssignmentRequest.builder().id(2).title("Asm 2")
                        .typeEvaluator(Constants.TypeAssignments.NORMAL).evalWeight(50).expectedLoc(50).build()
        ));
    }

    @Test
    void testUpdateList_AddNewAssignments() {
        // Given
        Subject subject = new Subject();
        subject.setId(request.getSubjectId());

        // Mock to call
        when(subjectRepository.findById(request.getSubjectId())).thenReturn(Optional.of(subject));
        when(assignmentRepository.findBySubject(subject)).thenReturn(Collections.emptyList());

        var mockedSubject = assignmentRepository.findBySubject(subject);
        System.out.println("Mocked Subject: " + mockedSubject);

        // Action
        Object result = assignmentService.updateList(request);

        // Then
        assertEquals("Add list assignments success!!!", result);
    }

    //exception, return, logger

    @Test
    void testUpdateList_InvalidTotalEvalWeight() {
        Subject subject = new Subject();
        subject.setId(request.getSubjectId());
        when(subjectRepository.findById(request.getSubjectId())).thenReturn(Optional.of(subject));
        when(assignmentRepository.findBySubject(subject)).thenReturn(Collections.emptyList());
        request.getAssignmentList().get(0).setEvalWeight(60);
        request.getAssignmentList().get(1).setEvalWeight(50);

        assertThrows(ApiInputException.class, () -> assignmentService.updateList(request));
    }

    /*@Test
    void testUpdateList_UpdateExistingAssignments() {
        Subject subject = new Subject();
        subject.setId(request.getSubjectId());
        Assignment existingAssignment1 = Assignment.builder()
                .id(1)
                .subject(subject).assignmentTitle("asm2")
                .evalWeight(50).expectedLoc(300)
                .build();

        Assignment existingAssignment1 = Assignment.builder()
                .id(1)
                .subject(subject).assignmentTitle("asm2")
                .evalWeight(50).expectedLoc(300)
                .build();
        Assignment existingAssignment2 = new Assignment(2, "Assignment 2", 50, 200, false, "Note 2", subject);
        Assignment assignment = new Assignment(1, "Assignment 1", 50, 50, "", true)
        when(subjectRepository.findById(request.getSubjectId())).thenReturn(Optional.of(subject));
        when(assignmentRepository.findBySubject(subject)).thenReturn(List.of(existingAssignment1, existingAssignment2));

        Object result = assignmentService.updateList(request);

        assertEquals("Update success!!", result);
    }*/

    @Test
    void should_successfully_save_list_assignment(){
        // Given
        Subject subject = new Subject();
        subject.setId(1);

        List<AssignmentRequest> assignmentList = new ArrayList<>();
        AssignmentRequest assignmentRequest1 = AssignmentRequest
                .builder()
                .id(1)
                .note("").title("asm1").expectedLoc(350).active(true)
                .evalWeight(70)
                .typeEvaluator(Constants.TypeAssignments.NORMAL)
                .build();
        AssignmentRequest assignmentRequest2 = AssignmentRequest
                .builder()
                .id(2)
                .typeEvaluator(Constants.TypeAssignments.NORMAL)
                .note("").title("asm2").expectedLoc(350).active(true)
                .evalWeight(30)
                .build();
        assignmentList.add(assignmentRequest1);
        assignmentList.add(assignmentRequest2);
        CreateAssignmentRequest createAssignmentRequest = new CreateAssignmentRequest(
                1,
                assignmentList
        );

        Assignment assignment1 = Assignment.builder()
                .id(1)
                .note("").assignmentTitle("asm1").expectedLoc(350)
                .evalWeight(50).subject(subject)
                .typeEvaluator(Constants.TypeAssignments.NORMAL)
                .build();
        Assignment assignment2 = Assignment.builder()
                .id(2)
                .note("").assignmentTitle("asm2").expectedLoc(350)
                .typeEvaluator(Constants.TypeAssignments.NORMAL)
                .evalWeight(50).subject(subject)
                .build();

        List<Assignment> existingAssignments = List.of(assignment1, assignment2);

        // Mock to call
        Subject mockSubject = new Subject();
        mockSubject.setId(createAssignmentRequest.getSubjectId());
        when(subjectRepository.findById(createAssignmentRequest.getSubjectId())).thenReturn(Optional.of(mockSubject));
        when(assignmentRepository.findBySubject(mockSubject)).thenReturn(existingAssignments);
        when(assignmentRepository.saveAll(anyList())).thenReturn(anyList());

        // Thêm log để kiểm tra mock
        Optional<Subject> mockedSubject = subjectRepository.findById(1);
        System.out.println("Mocked Subject: " + mockedSubject.orElse(null));

        // When
        Object result = assignmentService.updateList(createAssignmentRequest);


        // Then
        assertEquals("Update success!!", result);
        // Verify that assignments are saved/updated correctly
        verify(assignmentRepository, times(1)).saveAll(anyList());
    }

    @Test
    void should_throw_exception_when_subject_not_found() {
        // Given
        List<AssignmentRequest> assignmentList = new ArrayList<>();
        AssignmentRequest assignmentRequest1 = AssignmentRequest
                .builder()
                .id(1)
                .note("").title("asm1").expectedLoc(350).active(true)
                .evalWeight(70)
                .build();
        assignmentList.add(assignmentRequest1);
        CreateAssignmentRequest createAssignmentRequest = new CreateAssignmentRequest(1, assignmentList);

        //when(subjectRepository.findById(anyInt())).thenReturn(Optional.empty());

        // When/Then
        assertThrows(ApiInputException.class, () -> assignmentService.updateList(createAssignmentRequest));
    }

    @Test
    void getById_existingAssignment_shouldReturnAssignmentDTO() {
        // Arrange
        Integer assignmentId = 1;
        Assignment assignment = new Assignment();
        assignment.setId(assignmentId);
        when(assignmentRepository.findById(assignmentId)).thenReturn(Optional.of(assignment));

        // Act
        AssignmentDTO result = assignmentService.getById(assignmentId);

        // Assert
        assertNotNull(result);
        // Ad
        // d additional assertions for the returned AssignmentDTO if needed
    }

    @Test
    void getById_nonExistingAssignment_shouldThrowRecordNotFoundException() {
        // Arrange
        Integer nonExistingAssignmentId = 999;
        when(assignmentRepository.findById(nonExistingAssignmentId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RecordNotFoundException.class, () -> assignmentService.getById(nonExistingAssignmentId));
    }

    @Test
    void getById_nullId_shouldThrowException() {
        // Arrange
        Integer nullId = null;

        // Act & Assert
        assertThrows(Exception.class, () -> assignmentService.getById(nullId));
    }

    @Test
    void getById_negativeId_shouldThrowException() {
        // Arrange
        Integer negativeId = -1;

        // Act & Assert
        assertThrows(Exception.class, () -> assignmentService.getById(negativeId));
    }

    @Test
    void getById_zeroId_shouldThrowException() {
        // Arrange
        Integer zeroId = 0;

        // Act & Assert
        assertThrows(Exception.class, () -> assignmentService.getById(zeroId));
    }
}
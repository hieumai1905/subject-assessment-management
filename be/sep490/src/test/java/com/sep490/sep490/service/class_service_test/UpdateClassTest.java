package com.sep490.sep490.service.class_service_test;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.sep490.sep490.common.exception.ApiInputException;
import com.sep490.sep490.common.exception.NameAlreadyExistsException;
import com.sep490.sep490.common.exception.RecordNotFoundException;
import com.sep490.sep490.dto.ClassesDTO;
import com.sep490.sep490.entity.Classes;
import com.sep490.sep490.entity.Setting;
import com.sep490.sep490.entity.Subject;
import com.sep490.sep490.entity.User;
import com.sep490.sep490.mapper.ClassesMapper;
import com.sep490.sep490.repository.*;
import com.sep490.sep490.service.ClassService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;
import java.util.Arrays;

@ExtendWith(MockitoExtension.class)
public class UpdateClassTest {

    @Mock
    private ClassesRepository classesRepository;

    @Mock
    private SettingRepository settingRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SubjectRepository subjectRepository;
    @Mock
    private ClassesUserRepository classUserRepository;
    @Mock
    private ClassesMapper classesMapper;

    @InjectMocks
    private ClassService classService;

    @Test
    void testUpdateSuccess() {
        // Arrange
        Integer classId = 1;
        ClassesDTO request = new ClassesDTO();
        request.setClassCode("C123");
        request.setSemesterId(1);
        request.setTeacherId(2);
        request.setSubjectId(3);

        Classes existingClass = new Classes();
        existingClass.setId(1);
        Classes updatedClass = new Classes();

        Setting semesterSetting = new Setting();
        semesterSetting.setName("Semester 1");

        User teacherUser = new User();
        teacherUser.setFullname("Teacher A");

        Subject subject = new Subject();
        subject.setSubjectName("Math");

        // Mock repository calls
        when(classesRepository.findById(classId)).thenReturn(Optional.of(existingClass));
        when(classesMapper.convertUpdateClassDtoToClass(request, existingClass)).thenReturn(updatedClass);
        when(classesRepository.save(updatedClass)).thenReturn(updatedClass);
        updatedClass.setId(classId);

        // Mocking behavior for validateSemester and validateTeacher
        when(settingRepository.findSettingBySettingTypeAndSettingId("semester", request.getSemesterId())).thenReturn(new Setting());
        when(subjectRepository.checkSubjectTeacher(request.getSubjectId(), "added", request.getTeacherId())).thenReturn(new Subject());

        // Use doReturn() to handle potential null argument more flexibly
        doReturn(Optional.of(semesterSetting)).when(settingRepository).findById(any());
        doReturn(Optional.of(teacherUser)).when(userRepository).findById(any());
        doReturn(Optional.of(subject)).when(subjectRepository).findById(any());

        // Act
        ClassesDTO response = (ClassesDTO) classService.update(classId, request);

        // Assert
        assertNotNull(response);
    }


    @Test
    void testUpdateThrowsRecordNotFoundException() {
        // Arrange
        Integer classId = 1;
        ClassesDTO request = new ClassesDTO();

        when(classesRepository.findById(classId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RecordNotFoundException.class, () -> {
            classService.update(classId, request);
        });

        verify(classesRepository).findById(classId);
        verifyNoMoreInteractions(classesRepository, settingRepository, userRepository, subjectRepository);
    }

    @Test
    void testUpdateThrowsApiInputExceptionForInvalidSemester() {
        // Arrange
        Integer classId = 1;
        ClassesDTO request = new ClassesDTO();
        request.setSemesterId(1);
        request.setClassCode("C123");  // Ensure other required fields are set

        Classes existingClass = new Classes();
        existingClass.setId(classId);

        // Make sure this mock setup matches the method's logic
        when(classesRepository.findById(classId)).thenReturn(Optional.of(existingClass));

        // Mock to simulate an invalid semester
        when(settingRepository.findSettingBySettingTypeAndSettingId("semester", request.getSemesterId())).thenReturn(null);

        // Act & Assert
        assertThrows(ApiInputException.class, () -> {
            classService.update(classId, request);
        });

        // Verify that the repository methods were called as expected
        verify(classesRepository).findById(classId);
        verify(settingRepository).findSettingBySettingTypeAndSettingId("semester", request.getSemesterId());
        verifyNoMoreInteractions(classesRepository, settingRepository, userRepository, subjectRepository);
    }

    @Test
    void testUpdateThrowsApiInputExceptionForInvalidTeacher() {
        // Arrange
        Integer classId = 1;
        ClassesDTO request = new ClassesDTO();
        request.setSemesterId(1);
        request.setTeacherId(2);
        request.setSubjectId(3);
        request.setClassCode("C123"); // Make sure to set all required fields

        Classes existingClass = new Classes();
        existingClass.setId(classId);

        when(classesRepository.findById(classId)).thenReturn(Optional.of(existingClass));

        // Ensure this mock is aligned with what the update method expects
        when(settingRepository.findSettingBySettingTypeAndSettingId("semester", request.getSemesterId())).thenReturn(new Setting());

        // Mock to simulate an invalid teacher for the subject
        when(subjectRepository.checkSubjectTeacher(request.getSubjectId(), "added", request.getTeacherId())).thenReturn(null);

        // Act & Assert
        assertThrows(ApiInputException.class, () -> {
            classService.update(classId, request);
        });

        // Verify that these repository methods were called as expected
        verify(classesRepository).findById(classId);
        verify(settingRepository).findSettingBySettingTypeAndSettingId("semester", request.getSemesterId());
        verify(subjectRepository).checkSubjectTeacher(request.getSubjectId(), "added", request.getTeacherId());
        verifyNoMoreInteractions(classesRepository, settingRepository, userRepository, subjectRepository);
    }

    @Test
    void testUpdateThrowsNameAlreadyExistsException() {
        // Arrange
        Integer classId = 1;
        ClassesDTO request = new ClassesDTO();
        request.setClassCode("C123");
        request.setSemesterId(1);
        request.setTeacherId(2);
        request.setSubjectId(3);

        Classes existingClass = new Classes();
        existingClass.setId(classId);

        // Mocking a valid existing class
        when(classesRepository.findById(classId)).thenReturn(Optional.of(existingClass));

        // Ensure semester validation passes
        when(settingRepository.findSettingBySettingTypeAndSettingId("semester", request.getSemesterId())).thenReturn(new Setting());

        // Ensure teacher validation passes
        when(subjectRepository.checkSubjectTeacher(request.getSubjectId(), "added", request.getTeacherId())).thenReturn(new Subject());

        // Mock to simulate the existence of a class with the same class code
        when(classesRepository.findFirstByClassCodeAndSettingId(eq(request.getClassCode()), eq(request.getSemesterId()), any()))
                .thenReturn(Optional.of(new Classes()));

        // Act & Assert
        assertThrows(NameAlreadyExistsException.class, () -> {
            classService.update(classId, request);
        });

        // Verify method calls to ensure necessary methods are invoked
        verify(classesRepository).findById(classId);
        verify(settingRepository).findSettingBySettingTypeAndSettingId("semester", request.getSemesterId());
        verify(subjectRepository).checkSubjectTeacher(request.getSubjectId(), "added", request.getTeacherId());
        verify(classesRepository).findFirstByClassCodeAndSettingId(request.getClassCode(), request.getSemesterId(), null);
        verifyNoMoreInteractions(classesRepository, settingRepository, userRepository, subjectRepository);
    }

    @Test
    void testUpdateWithAllNullFields() {
        // Arrange
        Integer classId = 1;
        ClassesDTO request = new ClassesDTO(); // Using default constructor, all fields are null

        Classes existingClass = new Classes();

        when(classesRepository.findById(classId)).thenReturn(Optional.of(existingClass));

        // Act & Assert
        assertThrows(ApiInputException.class, () -> {
            classService.update(classId, request);
        });

        verify(classesRepository).findById(classId);
        verifyNoMoreInteractions(classesRepository, settingRepository, userRepository, subjectRepository);
    }

}

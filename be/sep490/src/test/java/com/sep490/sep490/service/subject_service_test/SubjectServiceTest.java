package com.sep490.sep490.service.subject_service_test;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.sep490.sep490.common.exception.ApiInputException;
import com.sep490.sep490.dto.SubjectTeacherDTO;
import com.sep490.sep490.entity.Setting;
import com.sep490.sep490.entity.Subject;
import com.sep490.sep490.entity.User;
import com.sep490.sep490.repository.SubjectRepository;
import com.sep490.sep490.repository.UserRepository;
import com.sep490.sep490.service.SubjectService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.*;

public class SubjectServiceTest {

    // Tao ra mock object của SubjectRepository, được sử dụng để tạo ra một đối tượng giả
    @Mock
    private SubjectRepository subjectRepository;
    @Mock
    private UserRepository userRepository;

    // Inject các các đối tượng giả (được tạo bằng @Mick) vào đối tượng đích
    // Mockito tự động inject mock object subjectRepository vào field subjectRepository của subjectService
    // Đối tượng được tiêm thường là đối tượng bạn muốn kiểm thử
    @InjectMocks
    private SubjectService subjectService;
    private Subject subject;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        subject = new Subject();
        subject.setId(1);
    }

    @Test
    void testUpdateSubjectTeachers_WithNullTeacherIds() {
        SubjectTeacherDTO request = new SubjectTeacherDTO();
        request.setSubjectId(1);
        request.setTeacherIds(null);

        when(subjectRepository.findById(1)).thenReturn(Optional.of(subject));

        String result = (String) subjectService.updateSubjectTeachers(request);
        assertEquals("Update teacher successful!!!", result);
        Assertions.assertTrue(subject.getTeachers().isEmpty());
    }

    @Test
    void testUpdateSubjectTeachers_WithEmptyTeacherIds() {
        SubjectTeacherDTO request = new SubjectTeacherDTO();
        request.setSubjectId(1);
        request.setTeacherIds(List.of());

        when(subjectRepository.findById(1)).thenReturn(Optional.of(subject));

        String result = (String) subjectService.updateSubjectTeachers(request);
        assertEquals("Update teacher successful!!!", result);
        Assertions.assertTrue(subject.getTeachers().isEmpty());
    }

    @Test
    void testUpdateSubjectTeachers_WithNullTeacherId() {
        SubjectTeacherDTO request = new SubjectTeacherDTO();
        request.setSubjectId(1);
        request.setTeacherIds(Arrays.asList(1, null, 2));

        when(subjectRepository.findById(1)).thenReturn(Optional.of(subject));
        when(userRepository.findById(1)).thenReturn(Optional.of(new User()));
        when(userRepository.findById(2)).thenReturn(Optional.of(new User()));

        assertThrows(ApiInputException.class, () -> subjectService.updateSubjectTeachers(request));

    }

    @Test
    void testUpdateSubjectTeachers_WithValidTeacherIds() {
        SubjectTeacherDTO request = new SubjectTeacherDTO();
        request.setSubjectId(1);
        request.setTeacherIds(Arrays.asList(1, 2));


        Setting setting = new Setting();
        setting.setName("TEACHER");

        User user1 = new User();
        user1.setRole(setting);
        User user2 = new User();
        user2.setRole(setting);

        when(subjectRepository.findById(1)).thenReturn(Optional.of(subject));
        when(userRepository.findById(1)).thenReturn(Optional.of(user1));
        when(userRepository.findById(2)).thenReturn(Optional.of(user2));

        String result = (String) subjectService.updateSubjectTeachers(request);
        assertEquals("Update teacher successful!!!", result);
        assertEquals(2, subject.getTeachers().size());
        assertTrue(subject.getTeachers().contains(user1));
        assertTrue(subject.getTeachers().contains(user2));
    }

    @Test
    void testUpdateSubjectTeachers_WithNonExistingSubject() {
        SubjectTeacherDTO request = new SubjectTeacherDTO();
        request.setSubjectId(1);
        request.setTeacherIds(Arrays.asList(1, 2));

        when(subjectRepository.findById(1)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> subjectService.updateSubjectTeachers(request));
    }
}

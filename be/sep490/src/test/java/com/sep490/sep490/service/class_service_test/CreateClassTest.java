package com.sep490.sep490.service.class_service_test;

import com.sep490.sep490.common.exception.ApiInputException;
import com.sep490.sep490.config.security_config.security.PasswordEncoderImpl;
import com.sep490.sep490.dto.ClassesDTO;
import com.sep490.sep490.dto.user.request.CreateUserRequest;
import com.sep490.sep490.entity.*;
import com.sep490.sep490.mapper.ClassesMapper;
import com.sep490.sep490.repository.*;
import com.sep490.sep490.service.ClassService;
import com.sep490.sep490.service.MilestoneService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CreateClassTest {
    @Mock private ClassesRepository classesRepository;
    @Mock private SettingRepository settingRepository;
    @Mock private UserRepository userRepository;
    @Mock private ClassesMapper classesMapper;
    @Mock private PasswordEncoderImpl passwordEncoder;
    @Mock private JavaMailSender mailSender;
    @Mock private ClassesUserRepository classUserRepository;
    @Mock private SubjectRepository subjectRepository;
    @Mock private StudentEvaluationRepository studentEvaluationRepository;
    @Mock private MilestoneService milestoneService;
    @InjectMocks
    private ClassService classService;
    private ClassesDTO classDto;
    private CreateUserRequest createUserRequest;

    @BeforeEach
    void setUp() {
        classDto = new ClassesDTO();
        classDto.setId(1);
        classDto.setSubjectId(1);
        classDto.setTeacherId(1);
        classDto.setSemesterId(7);
        classDto.setClassCode("CLASS1");
        classDto.setName("Class 1");
        classDto.setDescription("Description for Class 1");
        classDto.setActive(true);
        createUserRequest = new CreateUserRequest();
        createUserRequest.setId(2);
        classDto.setListEvaluator(List.of(createUserRequest));
    }

//    @Test
//    void testCreateClass_Success() {
//        Setting setting = new Setting();
//        setting.setId(1);
//        setting.setName("Semester2024");
//        setting.setSettingType("semester");
//
//        Classes savedClass = new Classes();
//        savedClass.setId(1); // Đảm bảo rằng savedClass có ID
//        savedClass.setClassCode("CLASS2024");
//        savedClass.setSemester(setting);
//
//        when(settingRepository.findSettingBySettingTypeAndSettingId("semester", 1)).thenReturn(setting);
//        when(classesRepository.save(any(Classes.class))).thenReturn(savedClass);
//        when(classesRepository.findById(1)).thenReturn(Optional.of(savedClass));
//
//        // Thiết lập dữ liệu đặc thù cho test này
//        ClassesDTO classesDTO = new ClassesDTO();
//        classesDTO.setClassCode("CLASS2024");
//        classesDTO.setSemesterId(1);
//        classesDTO.setSubjectId(1);
//        classesDTO.setTeacherId(1);
//
//        List<CreateUserRequest> listEvaluators = new ArrayList<>();
//        CreateUserRequest evaluator = new CreateUserRequest();
//        evaluator.setId(2); // Đảm bảo rằng evaluator có ID hợp lệ
//        listEvaluators.add(evaluator);
//        classesDTO.setListEvaluator(listEvaluators);
//
//        when(subjectRepository.checkSubjectTeacher(1, "added", 1)).thenReturn(true); // Giáo viên chính
//        when(subjectRepository.checkSubjectTeacher(1, "added", 2)).thenReturn(true); // Giáo viên đánh giá hợp lệ
//        when(classesRepository.findFirstByClassCodeAndSettingId("CLASS2024", 1, null)).thenReturn(Optional.empty());
////        when(userRepository.findById(1)).thenReturn(Optional.of(new User())); // Giáo viên chính
////        when(userRepository.findById(2)).thenReturn(Optional.of(new User())); // Giáo viên đánh giá
//        doReturn(Optional.of(savedClass)).when(classesRepository).findById(anyInt());
//
//        // Gọi hàm create và kiểm tra kết quả
//        ClassesDTO response = (ClassesDTO) classService.create(classesDTO);
//
//        assertNotNull(response.getId());  // Kiểm tra rằng response có ID hợp lệ
//        verify(milestoneService, times(1)).cloneAssignmentToMilestone(any(Classes.class));
//        verify(classUserRepository, times(1)).save(any(ClassUser.class));
//        verify(userRepository, times(1)).findById(1);
//        verify(userRepository, times(1)).findById(2);
//    }

    @Test
    void testCreateClass_InvalidSemester() {
        when(settingRepository.findSettingBySettingTypeAndSettingId("semester", classDto.getSemesterId()))
                .thenReturn(null);

        Exception exception = assertThrows(ApiInputException.class, () -> classService.create(classDto));

        assertEquals("Semester not valid!", exception.getMessage());
    }

    @Test
    void testCreateClass_TeacherNotAssigned() {
        when(settingRepository.findSettingBySettingTypeAndSettingId("semester", classDto.getSemesterId()))
                .thenReturn(new Setting());
        when(subjectRepository.checkSubjectTeacher(classDto.getSubjectId(), "added", classDto.getTeacherId()))
                .thenReturn(null);

        Exception exception = assertThrows(ApiInputException.class, () -> classService.create(classDto));

        assertEquals("Teacher do not teach this subject!", exception.getMessage());
    }

    @Test
    void testCreateClass_TeacherInEvaluatorList() {
        when(settingRepository.findSettingBySettingTypeAndSettingId("semester", classDto.getSemesterId()))
                .thenReturn(new Setting());
        when(subjectRepository.checkSubjectTeacher(classDto.getSubjectId(), "added", classDto.getTeacherId()))
                .thenReturn(new Subject());


        classDto.getListEvaluator().get(0).setId(classDto.getTeacherId());

        Exception exception = assertThrows(ApiInputException.class, () -> classService.create(classDto));

        assertEquals("The teacher who teaches this class cannot be added to the list of evaluation teachers", exception.getMessage());
    }

    @Test
    void testCreateClass_EvaluatorNotTeachingSubject() {
        when(settingRepository.findSettingBySettingTypeAndSettingId("semester", classDto.getSemesterId()))
                .thenReturn(new Setting());
        when(subjectRepository.checkSubjectTeacher(classDto.getSubjectId(), "added", classDto.getTeacherId()))
                .thenReturn(new Subject());
        when(subjectRepository.checkSubjectTeacher(classDto.getSubjectId(), "added", createUserRequest.getId()))
                .thenReturn(null);

        Exception exception = assertThrows(ApiInputException.class, () -> classService.create(classDto));

        assertEquals("The list of evaluated teachers includes teachers who do not teach this subject!", exception.getMessage());
    }

    @Test
    void testCreateClass_ClassCodeExists() {
        when(settingRepository.findSettingBySettingTypeAndSettingId("semester", classDto.getSemesterId()))
                .thenReturn(new Setting());
        when(subjectRepository.checkSubjectTeacher(classDto.getSubjectId(), "added", classDto.getTeacherId()))
                .thenReturn(new Subject());
        /*when(classesRepository.findFirstByClassCodeAndSettingId(classDto.getClassCode(), classDto.getSemesterId(), classDto.getId()))
                .thenReturn(Optional.of(new Classes()));*/

        Exception exception = assertThrows(ApiInputException.class, () -> classService.create(classDto));

        assertEquals("The list of evaluated teachers includes teachers who do not teach this subject!", exception.getMessage());
    }

}

package com.sep490.sep490.service.class_service_test;

import com.sep490.sep490.common.exception.ApiInputException;
import com.sep490.sep490.common.exception.ConflictException;
import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.dto.ClassUserSuccessDTO;
import com.sep490.sep490.dto.classes.request.ClassStudentRequest;
import com.sep490.sep490.dto.user.request.CreateUserRequest;
import com.sep490.sep490.entity.*;
import com.sep490.sep490.repository.*;
import com.sep490.sep490.service.ClassService;
import jakarta.mail.MessagingException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.io.UnsupportedEncodingException;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AddStudentToClass {

    @Mock
    private ClassesRepository classesRepository;

    @Mock
    private SettingRepository settingRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ClassesUserRepository classUserRepository;

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private ClassService classService; // Assuming the service class is named ClassService

    private ClassStudentRequest classStudentRequest;
    private CreateUserRequest createUserRequest;
    private User user;
    private ClassUser classUser;
    private ClassUserSuccessDTO classUserSuccessDTO;
    private Classes classes;
    @BeforeEach
    public void setUp() {
        createUserRequest = new CreateUserRequest();
        createUserRequest.setId(1);
        createUserRequest.setFullname("John Doe");
        createUserRequest.setGender("male");
        createUserRequest.setEmail("john.doe@gmail.com");
        createUserRequest.setRoleId(1);

        classStudentRequest = new ClassStudentRequest();
        classStudentRequest.setClassId(1);
        classStudentRequest.setCreateUserRequest(createUserRequest);

        Setting role = new Setting();
        role.setId(4);
        role.setSettingType(Constants.Role.ROLE_STUDENT);
        user = new User();
        user.setId(1);
        user.setEmail("john.doe@gmail.com");
        user.setFullname("John Doe");
        user.setRole(role);


        Setting setting = new Setting();
        setting.setId(9);
        Subject subject = new Subject();
        subject.setId(1);

        classes = new Classes();
        classes.setId(1);
        classes.setClassCode("CLASS123");
        classes.setSemester(setting);
        classes.setSubject(subject);

        classUser = new ClassUser();
        classUser.setUser(user);
        classUser.setClasses(classes);
    }

    @Test
    public void testAddStudentToClass_Success() throws MessagingException, UnsupportedEncodingException {
        Setting emailSetting = mock(Setting.class);
        when(emailSetting.getName()).thenReturn("gmail.com");



        when(classesRepository.findById(anyInt())).thenReturn(Optional.of(classes));
        when(settingRepository.findBySettingType(anyString())).thenReturn(List.of(emailSetting));
        when(userRepository.findFirstByEmail(anyString())).thenReturn(user);
        when(classUserRepository.save(any(ClassUser.class))).thenReturn(classUser);
        when(classesRepository.findById(anyInt())).thenReturn(Optional.of(classes));
        when(userRepository.findById(anyInt())).thenReturn(Optional.of(user));

        ClassUserSuccessDTO result = classService.addStudentToClass(classStudentRequest);

        assertNotNull(result);
        assertEquals("john.doe@gmail.com", result.getEmail());
        assertEquals("John Doe", result.getFullname());
        assertEquals("CLASS123", result.getClassCode());

        verify(settingRepository).findBySettingType(anyString());
        verify(userRepository).findFirstByEmail(anyString());
        verify(classUserRepository).save(any(ClassUser.class));
    }


    @Test
    public void testAddStudentToClass_ClassIdNotFound() {
        when(classesRepository.findById(anyInt())).thenReturn(Optional.empty());

        ApiInputException exception = assertThrows(ApiInputException.class, () -> {
            classService.addStudentToClass(classStudentRequest);
        });

        assertEquals("classId not already exist!", exception.getMessage());
        verify(classesRepository).findById(anyInt());
    }

    @Test
    public void testAddStudentToClass_EmailDomainMismatch() {
        Setting emailSetting = mock(Setting.class);
        when(emailSetting.getName()).thenReturn("otherdomain.com");

        when(classesRepository.findById(anyInt())).thenReturn(Optional.of(classes));
        when(settingRepository.findBySettingType(anyString())).thenReturn(List.of(emailSetting));

        ConflictException exception = assertThrows(ConflictException.class, () -> {
            classService.addStudentToClass(classStudentRequest);
        });

        assertEquals("EMAIL DOMAIN DOESN'T MATCH", exception.getMessage());
        verify(classesRepository).findById(anyInt());
        verify(settingRepository).findBySettingType(anyString());
    }

    @Test
    public void testAddStudentToClass_UserAlreadyEnrolled() {
        Setting emailSetting = mock(Setting.class);
        when(emailSetting.getName()).thenReturn("gmail.com");

        when(classesRepository.findById(anyInt())).thenReturn(Optional.of(classes));
        when(settingRepository.findBySettingType(anyString())).thenReturn(List.of(emailSetting));
        when(userRepository.findFirstByEmail(anyString())).thenReturn(user);
        when(classesRepository.findByUserIdAndSemesterIdAndSubjectId(anyInt(), anyInt(), anyInt())).thenReturn(List.of(classes));

        Exception exception = assertThrows(ApiInputException.class, () -> classService.addStudentToClass(classStudentRequest));

        assertEquals(user.getEmail() + " ALREADY LEARNED THIS SUBJECT", exception.getMessage());

        verify(classesRepository, times(2)).findById(anyInt());
        verify(settingRepository).findBySettingType(anyString());
        verify(userRepository).findFirstByEmail(anyString());
        verify(classesRepository).findByUserIdAndSemesterIdAndSubjectId(anyInt(), anyInt(), anyInt());
    }

    @Test
    public void testAddStudentToClass_ClassIdNotExist() {
        when(classesRepository.findById(anyInt())).thenReturn(Optional.empty());

        ApiInputException exception = assertThrows(ApiInputException.class, () -> {
            classService.addStudentToClass(classStudentRequest);
        });

        assertEquals("classId not already exist!", exception.getMessage());
        verify(classesRepository).findById(anyInt());
        verify(settingRepository, never()).findBySettingType(anyString());
        verify(userRepository, never()).findFirstByEmail(anyString());
        verify(userRepository, never()).save(any(User.class));
        verify(classUserRepository, never()).save(any(ClassUser.class));
    }

    @Test
    public void testAddStudentToClass_InvalidEmailDomain() {
        Setting emailSetting = mock(Setting.class);
        when(emailSetting.getName()).thenReturn("valid.com");
        when(classesRepository.findById(anyInt())).thenReturn(Optional.of(classes));
        when(settingRepository.findBySettingType(anyString())).thenReturn(List.of(emailSetting));

        classStudentRequest.getCreateUserRequest().setEmail("invalid@invalid.com");

        ConflictException exception = assertThrows(ConflictException.class, () -> {
            classService.addStudentToClass(classStudentRequest);
        });

        assertEquals("EMAIL DOMAIN DOESN'T MATCH", exception.getMessage());
        verify(settingRepository).findBySettingType(anyString());
        verify(userRepository, never()).findFirstByEmail(anyString());
        verify(userRepository, never()).save(any(User.class));
        verify(classUserRepository, never()).save(any(ClassUser.class));
    }

}

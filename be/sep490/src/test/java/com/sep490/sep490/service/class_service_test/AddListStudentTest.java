//package com.sep490.sep490.service.class_service_test;
//
//import com.sep490.sep490.common.exception.ApiInputException;
//import com.sep490.sep490.common.exception.ConflictException;
//import com.sep490.sep490.common.utils.Constants;
//import com.sep490.sep490.dto.ClassUserSuccessDTO;
//import com.sep490.sep490.dto.classes.request.ClassListStudentRequest;
//import com.sep490.sep490.dto.user.request.CreateUserRequest;
//import com.sep490.sep490.entity.*;
//import com.sep490.sep490.repository.*;
//import com.sep490.sep490.service.ClassService;
//import jakarta.mail.MessagingException;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.mail.javamail.JavaMailSender;
//import org.springframework.security.crypto.password.PasswordEncoder;
//
//import java.io.UnsupportedEncodingException;
//import java.util.ArrayList;
//import java.util.List;
//import java.util.Optional;
//
//import static org.junit.jupiter.api.Assertions.assertEquals;
//import static org.junit.jupiter.api.Assertions.assertThrows;
//import static org.mockito.ArgumentMatchers.anyInt;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//public class AddListStudentTest {
//    @Mock
//    private ClassesRepository classesRepository;
//
//    @Mock
//    private ClassesUserRepository classUserRepository;
//
//    @Mock
//    private UserRepository userRepository;
//
//    @Mock
//    private SettingRepository settingRepository;
//
//    @Mock
//    private JavaMailSender mailSender;
//
//    @Mock
//    private PasswordEncoder passwordEncoder;
//
//    @InjectMocks
//    private ClassService classService;
//
//    private ClassListStudentRequest classListStudentRequest;
//
//    @BeforeEach
//    void setUp(){
//        classListStudentRequest = new ClassListStudentRequest();
//        classListStudentRequest.setClassId(1);
//        List<CreateUserRequest> createUserRequests = new ArrayList<>();
//        CreateUserRequest createUserRequest = new CreateUserRequest();
//        createUserRequest.setEmail("toannkhe163639@fpt.edu.vn");
//        createUserRequests.add(createUserRequest);
//        classListStudentRequest.setList(createUserRequests);
//    }
//
//    @Test
//    void addListStudent_ClassIdNotExist_ThrowsApiInputException() {
//        when(classesRepository.findById(anyInt())).thenReturn(Optional.empty());
//
//        assertThrows(ApiInputException.class, () -> {
//            classService.addListStudent(classListStudentRequest);
//        });
//
//        verify(classesRepository, times(1)).findById(anyInt());
//    }
//
//    @Test
//    void addListStudent_EmailDomainDoesNotMatch_ThrowsConflictException() {
//        when(classesRepository.findById(anyInt())).thenReturn(Optional.of(new Classes()));
//        when(settingRepository.findBySettingType(anyString())).thenReturn(new ArrayList<>());
//
//        assertThrows(ConflictException.class, () -> {
//            classService.addListStudent(classListStudentRequest);
//        });
//
//        verify(classesRepository, times(1)).findById(anyInt());
//        verify(settingRepository, times(1)).findBySettingType(anyString());
//    }
//
//    @Test
//    void addListStudent_ExistingStudent_Success() throws MessagingException, UnsupportedEncodingException {
//        Classes aClass = getClasses();
//
//        when(classesRepository.findById(classListStudentRequest.getClassId())).thenReturn(Optional.of(aClass));
//        when(classUserRepository.findAllByClassId(classListStudentRequest.getClassId())).thenReturn(new ArrayList<>());
//        Setting emailSetting = new Setting();
//        emailSetting.setName("fpt.edu.vn");
//        when(settingRepository.findBySettingType(anyString())).thenReturn(List.of(emailSetting));
//
//
//        // Create existing user
//        User existingUser = new User();
//        existingUser.setId(1);
//        existingUser.setEmail("toannkhe163639@fpt.edu.vn");
//        existingUser.setFullname("Student");
//        Setting role = new Setting();
//        role.setId(Constants.Role.STUDENT);
//        existingUser.setRole(role);
//
//        // Mock user repository response
//        when(userRepository.findFirstByEmail("toannkhe163639@fpt.edu.vn")).thenReturn(existingUser);
//        when(classesRepository.findByUserIdAndSemesterIdAndSubjectId(anyInt(), anyInt(), anyInt())).thenReturn(new ArrayList<>());
//        when(userRepository.findById(anyInt())).thenReturn(Optional.of(existingUser));
//
//        List<ClassUserSuccessDTO> result = classService.addListStudent(classListStudentRequest);
//
//        // Assertions
//        assertEquals(1, result.size());
//        assertEquals("toannkhe163639@fpt.edu.vn", result.get(0).getEmail());
//        assertEquals("Student", result.get(0).getFullname());
//
//        // Verify interactions
//        verify(classesRepository, times(4)).findById(classListStudentRequest.getClassId());
//        verify(classUserRepository, times(1)).findAllByClassId(classListStudentRequest.getClassId());
//        verify(settingRepository, times(1)).findBySettingType(anyString());
//        verify(userRepository, times(1)).findFirstByEmail("toannkhe163639@fpt.edu.vn");
//        verify(classUserRepository, times(1)).save(any(ClassUser.class));
//    }
//
//    private Classes getClasses() {
//        Classes aClass = new Classes();
//        aClass.setId(classListStudentRequest.getClassId());
//
//        // Create and set semester
//        Setting semester = new Setting();
//        semester.setId(1); // Ensure this ID matches with expected logic
//        semester.setName("Semester");
//        aClass.setSemester(semester);
//
//        // Create and set subject
//        Subject subject = new Subject();
//        subject.setId(1); // Ensure this ID matches with expected logic
//        aClass.setSubject(subject);
//        return aClass;
//    }
//
//    @Test
//    void addListStudent_Failure() throws MessagingException, UnsupportedEncodingException {
//        // Set up Classes
//        Classes aClass =getClasses();
//
//        when(classesRepository.findById(classListStudentRequest.getClassId())).thenReturn(Optional.of(aClass));
//        when(classUserRepository.findAllByClassId(classListStudentRequest.getClassId())).thenReturn(new ArrayList<>());
//
//        // Simulate an error when finding email setting
//        when(settingRepository.findBySettingType(anyString())).thenThrow(new RuntimeException("Database error"));
//
//        // Call the method under test and expect an exception
//        assertThrows(RuntimeException.class, () -> classService.addListStudent(classListStudentRequest));
//
//        // Verify interactions
//        verify(classesRepository, times(1)).findById(classListStudentRequest.getClassId());
//        verify(classUserRepository, times(1)).findAllByClassId(classListStudentRequest.getClassId());
//        verify(settingRepository, times(1)).findBySettingType(anyString());
//        verify(userRepository, never()).findFirstByEmail(anyString());
//        verify(classUserRepository, never()).save(any(ClassUser.class));
//    }
//
//    @Test
//    void addListStudent_ClassNotFound_Failure() throws MessagingException, UnsupportedEncodingException {
//        // Set up: Class does not exist
//        when(classesRepository.findById(classListStudentRequest.getClassId())).thenReturn(Optional.empty());
//
//        // Call the method under test and expect an exception
//        assertThrows(ApiInputException.class, () -> classService.addListStudent(classListStudentRequest));
//
//        // Verify interactions
//        verify(classesRepository, times(1)).findById(classListStudentRequest.getClassId());
//        verify(classUserRepository, never()).findAllByClassId(anyInt());
//        verify(settingRepository, never()).findBySettingType(anyString());
//        verify(userRepository, never()).findFirstByEmail(anyString());
//        verify(classUserRepository, never()).save(any(ClassUser.class));
//    }
//
//    @Test
//    void addListStudent_InvalidRole_Failure() throws MessagingException, UnsupportedEncodingException {
//        // Set up Classes
//        Classes aClass = new Classes();
//        aClass.setId(classListStudentRequest.getClassId());
//
//        when(classesRepository.findById(classListStudentRequest.getClassId())).thenReturn(Optional.of(aClass));
//        when(classUserRepository.findAllByClassId(classListStudentRequest.getClassId())).thenReturn(new ArrayList<>());
//
//        // Set up Setting
//        Setting emailSetting = new Setting();
//        emailSetting.setName("fpt.edu.vn");
//        when(settingRepository.findBySettingType(anyString())).thenReturn(List.of(emailSetting));
//
//        // Existing user with invalid role
//        User existingUser = new User();
//        existingUser.setId(1);
//        existingUser.setEmail("toannkhe163639@fpt.edu.vn");
//        Setting invalidRole = new Setting();
//        invalidRole.setId(999); // Invalid role id
//        existingUser.setRole(invalidRole);
//
//        when(userRepository.findFirstByEmail("toannkhe163639@fpt.edu.vn")).thenReturn(existingUser);
//
//        // Call the method under test and expect an exception
//        assertThrows(NullPointerException.class, () -> classService.addListStudent(classListStudentRequest));
//
//        // Verify interactions
//        verify(classesRepository, times(3)).findById(classListStudentRequest.getClassId());
//        verify(classUserRepository, times(1)).findAllByClassId(classListStudentRequest.getClassId());
//        verify(settingRepository, times(1)).findBySettingType(anyString());
//        verify(userRepository, times(1)).findFirstByEmail("toannkhe163639@fpt.edu.vn");
//        verify(classUserRepository, never()).save(any(ClassUser.class));
//    }
//
//    @Test
//    void addListStudent_ExistingStudentInClass_Failure() throws MessagingException, UnsupportedEncodingException {
//        // Set up Classes
//        Classes aClass = new Classes();
//        aClass.setId(classListStudentRequest.getClassId());
//
//        when(classesRepository.findById(classListStudentRequest.getClassId())).thenReturn(Optional.of(aClass));
//
//        // Existing ClassUser
//        ClassUser existingClassUser = new ClassUser();
//        existingClassUser.setClasses(aClass);
//        existingClassUser.setUser(new User());
//        when(classUserRepository.findAllByClassId(classListStudentRequest.getClassId())).thenReturn(List.of(existingClassUser));
//
//        // Existing user
//        User existingUser = new User();
//        existingUser.setId(1);
//        existingUser.setEmail("toannkhe163639@fpt.edu.vn");
//        when(userRepository.findFirstByEmail("toannkhe163639@fpt.edu.vn")).thenReturn(existingUser);
//
//        // Call the method under test and expect an exception
//        assertThrows(NullPointerException.class, () -> classService.addListStudent(classListStudentRequest));
//
//        // Verify interactions
//        verify(classesRepository, times(1)).findById(classListStudentRequest.getClassId());
//        verify(classUserRepository, times(1)).findAllByClassId(classListStudentRequest.getClassId());
//        verify(userRepository, times(1)).findFirstByEmail("toannkhe163639@fpt.edu.vn");
//        verify(classUserRepository, never()).save(any(ClassUser.class));
//    }
//}

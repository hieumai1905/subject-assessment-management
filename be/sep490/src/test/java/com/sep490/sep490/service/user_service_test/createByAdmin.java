package com.sep490.sep490.service.user_service_test;

import com.sep490.sep490.common.exception.ConflictException;
import com.sep490.sep490.common.exception.NameAlreadyExistsException;
import com.sep490.sep490.common.exception.RecordNotFoundException;
import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.config.security_config.security.PasswordEncoderImpl;
import com.sep490.sep490.dto.UserDTO;
import com.sep490.sep490.dto.user.request.CreateUserRequest;
import com.sep490.sep490.dto.user.request.NewPassAfterForgot;
import com.sep490.sep490.entity.Setting;
import com.sep490.sep490.entity.User;
import com.sep490.sep490.mapper.UserMapper;
import com.sep490.sep490.repository.*;
import com.sep490.sep490.service.UserService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;

import java.io.UnsupportedEncodingException;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class createByAdmin {
    @Mock
    private UserRepository userRepository;

    @Mock
    private SettingRepository settingRepository;

    @Mock
    private PasswordEncoderImpl passwordEncoder;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private UserService userService;
    @Mock
    private JavaMailSender mailSender;

    private CreateUserRequest request;
    private User foundUserByUsername;
    private User foundUserByEmail;
    private Setting userRole;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        // Chuẩn bị dữ liệu cho test
        request = new CreateUserRequest();
        request.setEmail("test@example.com");
        request.setRoleId(1);

        foundUserByUsername = new User();
        foundUserByUsername.setUsername("test@example.com");

        foundUserByEmail = new User();
        foundUserByEmail.setEmail("test@example.com");

        userRole = new Setting();
        userRole.setId(1);
        userRole.setName(Constants.Role.ROLE_STUDENT);
    }

    @Test
    void testCreateByAdminInvalidEmailDomain() {
        // Arrange
        request.setEmail("test@invalid.com");
        List<String> emailDomains = List.of("example.com", "test.com");
        when(settingRepository.findBySettingType(Constants.SettingType.EMAIL)).thenReturn(emailDomains.stream().map(domain -> {
            Setting setting = new Setting();
            setting.setName(domain);
            return setting;
        }).toList());

        // Act & Assert
        ConflictException exception = assertThrows(ConflictException.class, () -> {
            userService.createByAdmin(request);
        });

        assertEquals("Email domain doesn't match!", exception.getMessage());
        verify(settingRepository).findBySettingType(Constants.SettingType.EMAIL);
    }

    @Test
    void testCreateByAdminUsernameAlreadyExists() {

        Setting setting = new Setting();
        setting.setId(1);
        setting.setName("example.com");

        // Arrange
        when(settingRepository.findBySettingType(Constants.SettingType.EMAIL)).thenReturn(List.of(setting));
        when(userRepository.findByUsername(request.getEmail())).thenReturn(foundUserByUsername);

        // Act & Assert
        NameAlreadyExistsException exception = assertThrows(NameAlreadyExistsException.class, () -> {
            userService.createByAdmin(request);
        });

        assertEquals("Username is already existed!", exception.getMessage());
        verify(userRepository).findByUsername(request.getEmail());
    }

    @Test
    void testCreateByAdminSuccess() throws MessagingException, UnsupportedEncodingException {
        Setting setting = new Setting();
        setting.setId(1);
        setting.setName("example.com");

        // Arrange
        when(settingRepository.findBySettingType(Constants.SettingType.EMAIL)).thenReturn(List.of(setting));
        when(userRepository.findByUsername(request.getEmail())).thenReturn(null);
        when(userRepository.findFirstByEmail(request.getEmail())).thenReturn(null);
        when(settingRepository.findById(request.getRoleId())).thenReturn(Optional.of(userRole));

        User newUser = new User();
        newUser.setEmail(request.getEmail());
        newUser.setRole(userRole);

        when(userMapper.convertCrateUserRequestToUser(request, userRole)).thenReturn(newUser);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");

        // Giả lập hành vi của sendEmailPass và sendEmailContent
        MimeMessage mimeMessage = mock(MimeMessage.class);
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        doNothing().when(mailSender).send(mimeMessage);

        // Act
        UserDTO result = userService.createByAdmin(request);

        // Assert
        assertNotNull(result);
        assertEquals("test@example.com", result.getEmail());

        verify(userRepository).save(newUser);
        verify(passwordEncoder).encode(anyString());
        verify(mailSender).createMimeMessage();
        verify(mailSender).send(mimeMessage);
    }


}

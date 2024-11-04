package com.sep490.sep490.service;

import com.sep490.sep490.common.exception.UnauthorizedException;
import com.sep490.sep490.common.utils.Constants;
import com.sep490.sep490.config.security_config.jwt.JwtUserDetailsService;
import com.sep490.sep490.config.security_config.jwt.JwtUtil;
import com.sep490.sep490.config.security_config.security.PasswordEncoderImpl;
import com.sep490.sep490.dto.user.request.LoginRequest;
import com.sep490.sep490.dto.user.response.LoginResponse;
import com.sep490.sep490.entity.*;
import com.sep490.sep490.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class LoginServiceTest {
    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtUserDetailsService jwtUserDetailsService;

    @Mock
    private PasswordEncoderImpl passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private SettingRepository settingRepository;

    @InjectMocks
    private UserService loginService;

    private User foundUser;
    private Setting role;
    private UserDetails userDetails;
    private Setting setting;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        // Mock data setup
        foundUser = new User();
        foundUser.setUsername("username");
        foundUser.setPassword("$2a$10$ozrCfGRzRFa0niy6tyu3/urL2QL7yUvziwXA7tLhLtVS7ORZklP72");
        foundUser.setActive(true);
        foundUser.setStatus(Constants.UserStatus.VERIFIED);

        role = new Setting();
        role.setId(1);
        role.setName(Constants.Role.ROLE_STUDENT);
        role.setSettingType("Role");
        foundUser.setRole(role);

        userDetails = mock(UserDetails.class);

        setting = new Setting();
        setting.setName("ROLE_USER");
    }

    @Test
    void testLoginByUsernamePassSuccess() {
        LoginRequest request = new LoginRequest("username", "12345678");

        User foundUser = new User();
        foundUser.setUsername("username");
        foundUser.setPassword("encodedPassword");
        foundUser.setStatus(Constants.UserStatus.VERIFIED);
        foundUser.setActive(true);
        Setting role = new Setting();
        role.setId(1);
        role.setName(Constants.Role.ROLE_STUDENT);
        foundUser.setRole(role);

        UserDetails userDetails = mock(UserDetails.class);

        when(userRepository.findByUsername("username")).thenReturn(foundUser);
        when(passwordEncoder.matches("12345678", "encodedPassword")).thenReturn(true);
        when(jwtUserDetailsService.loadUserByUsername("username")).thenReturn(userDetails);
        when(jwtUtil.generateToken(userDetails)).thenReturn("token");
        when(settingRepository.findById(1)).thenReturn(Optional.of(role));

        LoginResponse response = loginService.loginByUsernamePass(request);

        assertNotNull(response);
        assertEquals("token", response.getToken());
        assertEquals(Constants.Role.ROLE_STUDENT, response.getRole());
        assertEquals("username", response.getUser().getUsername());

        verify(userRepository).findByUsername("username");
        verify(passwordEncoder).matches("12345678", "encodedPassword");
        verify(jwtUserDetailsService).loadUserByUsername("username");
        verify(jwtUtil).generateToken(userDetails);
        verify(settingRepository).findById(1);
    }

    @Test
    void testLoginByUsernamePassUserNotActive() {
        // Arrange
        LoginRequest request = new LoginRequest("username", "12345678");
        foundUser.setActive(false);  // Giả lập tài khoản chưa được kích hoạt

        when(userRepository.findByUsername(anyString())).thenReturn(foundUser);

        // Act & Assert
        UnauthorizedException exception = assertThrows(UnauthorizedException.class, () -> {
            loginService.loginByUsernamePass(request);
        });

        assertEquals("Your account has been locked!", exception.getMessage());
        verify(userRepository).findByUsername("username");
    }

    @Test
    void testLoginByUsernamePassUserNotVerified() {
        // Arrange
        LoginRequest request = new LoginRequest("username", "12345678");
        foundUser.setStatus(Constants.UserStatus.UNDEFINED);  // Giả lập tài khoản chưa được xác minh

        when(userRepository.findByUsername(anyString())).thenReturn(foundUser);

        // Act & Assert
        UnauthorizedException exception = assertThrows(UnauthorizedException.class, () -> {
            loginService.loginByUsernamePass(request);
        });

        assertEquals("Your account has not been verified!", exception.getMessage());
        verify(userRepository).findByUsername("username");
    }

    @Test
    void testLoginByUsernamePassIncorrectPassword() {
        // Arrange
        LoginRequest request = new LoginRequest("username", "wrongPassword");

        when(userRepository.findByUsername(anyString())).thenReturn(foundUser);
        when(passwordEncoder.matches(any(CharSequence.class), anyString())).thenReturn(false);  // Giả lập mật khẩu không chính xác

        // Act & Assert
        UnauthorizedException exception = assertThrows(UnauthorizedException.class, () -> {
            loginService.loginByUsernamePass(request);
        });

        assertEquals("Username or password is incorrect!", exception.getMessage());
        verify(userRepository).findByUsername("username");
        verify(passwordEncoder).matches(any(CharSequence.class), anyString());
    }


}

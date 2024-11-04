package com.sep490.sep490.service.user_service_test;

import com.sep490.sep490.common.exception.ConflictException;
import com.sep490.sep490.common.exception.RecordNotFoundException;
import com.sep490.sep490.config.security_config.security.PasswordEncoderImpl;
import com.sep490.sep490.dto.UserDTO;
import com.sep490.sep490.dto.user.request.NewPassAfterForgot;
import com.sep490.sep490.entity.User;
import com.sep490.sep490.repository.*;
import com.sep490.sep490.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

public class UserServiceTest {
    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoderImpl passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User foundUserByEmail;

    @BeforeEach
    void setUp() {
        // Khởi tạo các mock object
        MockitoAnnotations.openMocks(this);
        // Mock data setup
        foundUserByEmail = new User();
        foundUserByEmail.setEmail("test@gmail.com");
        foundUserByEmail.setPassword("oldPasswordHash");
    }

    @Test
    void testNewPassAfterForgotEmailNotFound() {
        // Arrange
        NewPassAfterForgot request = new NewPassAfterForgot();
        request.setEmail("nonexistent@gmail.com");
        request.setPass("newPassword");
        request.setConfirmPass("newPassword");

        when(userRepository.findFirstByEmail(request.getEmail())).thenReturn(null);

        // Act & Assert
        RecordNotFoundException exception = assertThrows(RecordNotFoundException.class, () -> {
            userService.newPassAfterForgot(request);
        });

        assertEquals("Email not found!", exception.getMessage());
        verify(userRepository).findFirstByEmail(request.getEmail());
    }

    @Test
    void testNewPassAfterForgotPasswordMismatch() {
        // Arrange
        NewPassAfterForgot request = new NewPassAfterForgot();
        request.setEmail("test@gmail.com");
        request.setPass("newPassword");
        request.setConfirmPass("differentPassword");

        when(userRepository.findFirstByEmail(request.getEmail())).thenReturn(foundUserByEmail);

        // Act & Assert
        ConflictException exception = assertThrows(ConflictException.class, () -> {
            userService.newPassAfterForgot(request);
        });

        assertEquals("Confirm Password doesn't match!", exception.getMessage());
        verify(userRepository).findFirstByEmail(request.getEmail());
    }

    @Test
    void testNewPassAfterForgotSuccess() {
        // Arrange
        NewPassAfterForgot request = new NewPassAfterForgot();
        request.setEmail("test@gmail.com");
        request.setPass("newPassword");
        request.setConfirmPass("newPassword");

        when(userRepository.findFirstByEmail(request.getEmail())).thenReturn(foundUserByEmail);
        when(passwordEncoder.encode(request.getPass())).thenReturn("newPasswordHash");

        // Act
        UserDTO result = userService.newPassAfterForgot(request);

        // Assert
        assertNotNull(result);
        assertEquals("test@gmail.com", result.getEmail());
        verify(userRepository).findFirstByEmail(request.getEmail());
        verify(userRepository).save(foundUserByEmail);
        assertEquals("newPasswordHash", foundUserByEmail.getPassword());
    }
}

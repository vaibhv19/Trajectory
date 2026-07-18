package com.trajectory.backend.service;

import com.trajectory.backend.dto.AuthResponse;
import com.trajectory.backend.dto.LoginRequest;
import com.trajectory.backend.dto.RegisterRequest;
import com.trajectory.backend.model.CareerProfile;
import com.trajectory.backend.model.User;
import com.trajectory.backend.model.RefreshToken;
import com.trajectory.backend.repository.CareerProfileRepository;
import com.trajectory.backend.repository.UserRepository;
import com.trajectory.backend.security.JwtTokenProvider;
import com.trajectory.backend.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.trajectory.backend.exception.BadRequestException;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CareerProfileRepository careerProfileRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private StorageService storageService;

    private UserService userService;

    @BeforeEach
    void setUp() {
        userService = new UserService(
                userRepository,
                careerProfileRepository,
                passwordEncoder,
                authenticationManager,
                tokenProvider,
                refreshTokenService,
                storageService
        );
    }

    @Test
    void registerUser_Success() {
        // Arrange
        RegisterRequest request = new RegisterRequest("test@email.com", "password", "Test User");
        User savedUser = User.builder()
                .id(UUID.randomUUID())
                .email(request.email())
                .passwordHash("hashed-pwd")
                .fullName(request.fullName())
                .build();

        RefreshToken mockRefreshToken = RefreshToken.builder().token("mock-refresh-token").build();
        when(userRepository.existsByEmail(request.email())).thenReturn(false);
        when(passwordEncoder.encode(request.password())).thenReturn("hashed-pwd");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(tokenProvider.generateTokenForUser(any(UserPrincipal.class))).thenReturn("mock-jwt-token");
        when(refreshTokenService.createRefreshToken(any(UUID.class))).thenReturn(mockRefreshToken);

        // Act
        AuthResponse response = userService.registerUser(request);

        // Assert
        assertNotNull(response);
        assertEquals("mock-jwt-token", response.token());
        assertEquals("mock-refresh-token", response.refreshToken());
        assertEquals("test@email.com", response.email());
        assertEquals("Test User", response.fullName());
        assertEquals(savedUser.getId(), response.userId());

        verify(userRepository).existsByEmail(request.email());
        verify(passwordEncoder).encode(request.password());
        verify(userRepository).save(any(User.class));
        verify(careerProfileRepository).save(any(CareerProfile.class));
    }

    @Test
    void registerUser_ThrowsExceptionWhenEmailExists() {
        // Arrange
        RegisterRequest request = new RegisterRequest("existing@email.com", "password", "Existing User");
        when(userRepository.existsByEmail(request.email())).thenReturn(true);

        // Act & Assert
        assertThrows(BadRequestException.class, () -> userService.registerUser(request));
        verify(userRepository).existsByEmail(request.email());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void getUserProfile_Success() {
        // Arrange
        UUID userId = UUID.randomUUID();
        User user = User.builder()
                .id(userId)
                .email("profile@email.com")
                .fullName("Profile User")
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        // Act
        User result = userService.getUserProfile(userId);

        // Assert
        assertNotNull(result);
        assertEquals(userId, result.getId());
        assertEquals("profile@email.com", result.getEmail());
        verify(userRepository).findById(userId);
    }
}

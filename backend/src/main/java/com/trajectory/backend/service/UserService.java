package com.trajectory.backend.service;

import com.trajectory.backend.dto.LoginRequest;
import com.trajectory.backend.dto.RegisterRequest;
import com.trajectory.backend.dto.AuthResponse;
import com.trajectory.backend.model.CareerProfile;
import com.trajectory.backend.model.User;
import com.trajectory.backend.repository.CareerProfileRepository;
import com.trajectory.backend.repository.UserRepository;
import com.trajectory.backend.security.JwtTokenProvider;
import com.trajectory.backend.security.UserPrincipal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final CareerProfileRepository careerProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public UserService(UserRepository userRepository, 
                       CareerProfileRepository careerProfileRepository,
                       PasswordEncoder passwordEncoder, 
                       AuthenticationManager authenticationManager, 
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.careerProfileRepository = careerProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthResponse registerUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email is already taken");
        }

        User user = User.builder()
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .fullName(request.fullName())
                .authProvider("LOCAL")
                .ghostThresholdDays(30)
                .autoArchiveEnabled(false)
                .build();

        User savedUser = userRepository.save(user);

        // Auto-create a default Career Profile
        CareerProfile defaultProfile = CareerProfile.builder()
                .user(savedUser)
                .title("Software Engineer")
                .colorCode("#3b82f6")
                .iconIdentifier("Briefcase")
                .isDefault(true)
                .build();
        careerProfileRepository.save(defaultProfile);

        log.info("Registered new user: {} and created default career profile", savedUser.getEmail());

        // Authenticate new user automatically
        UserPrincipal principal = UserPrincipal.create(savedUser);
        String token = tokenProvider.generateTokenForUser(principal);
        return new AuthResponse(token, savedUser.getEmail(), savedUser.getFullName(), savedUser.getId());
    }

    public AuthResponse loginUser(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        String token = tokenProvider.generateToken(authentication);

        User user = userRepository.findById(principal.getId()).orElseThrow();

        log.info("User logged in: {}", user.getEmail());
        return new AuthResponse(token, user.getEmail(), user.getFullName(), user.getId());
    }

    @Transactional(readOnly = true)
    public User getUserProfile(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public User updateUserProfile(UUID userId, String fullName, String avatarUrl) {
        User user = getUserProfile(userId);
        if (fullName != null) user.setFullName(fullName);
        if (avatarUrl != null) user.setAvatarUrl(avatarUrl);
        return userRepository.save(user);
    }

    @Transactional
    public void changePassword(UUID userId, String oldPassword, String newPassword) {
        User user = getUserProfile(userId);
        if (!passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("Incorrect current password");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional
    public User updateSettings(UUID userId, int ghostThresholdDays, boolean autoArchiveEnabled) {
        User user = getUserProfile(userId);
        user.setGhostThresholdDays(ghostThresholdDays);
        user.setAutoArchiveEnabled(autoArchiveEnabled);
        return userRepository.save(user);
    }
}

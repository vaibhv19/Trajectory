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

import com.trajectory.backend.exception.ResourceNotFoundException;
import com.trajectory.backend.exception.BadRequestException;
import java.util.UUID;

@Service
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final CareerProfileRepository careerProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final StorageService storageService;
    private final String avatarsBucket = "avatars";

    public UserService(UserRepository userRepository, 
                       CareerProfileRepository careerProfileRepository,
                       PasswordEncoder passwordEncoder, 
                       AuthenticationManager authenticationManager, 
                       JwtTokenProvider tokenProvider,
                       RefreshTokenService refreshTokenService,
                       StorageService storageService) {
        this.userRepository = userRepository;
        this.careerProfileRepository = careerProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.refreshTokenService = refreshTokenService;
        this.storageService = storageService;
    }

    @Transactional
    public AuthResponse registerUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email is already taken");
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
        String refreshToken = refreshTokenService.createRefreshToken(savedUser.getId()).getToken();
        return new AuthResponse(token, refreshToken, savedUser.getEmail(), savedUser.getFullName(), savedUser.getId());
    }

    public AuthResponse loginUser(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        String token = tokenProvider.generateToken(authentication);
        String refreshToken = refreshTokenService.createRefreshToken(principal.getId()).getToken();

        User user = userRepository.findById(principal.getId()).orElseThrow();

        log.info("User logged in: {}", user.getEmail());
        return new AuthResponse(token, refreshToken, user.getEmail(), user.getFullName(), user.getId());
    }

    @Transactional(readOnly = true)
    public User getUserProfile(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
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
            throw new BadRequestException("Incorrect current password");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional
    public User updateSettings(UUID userId, int ghostThresholdDays, boolean autoArchiveEnabled, boolean browserNotificationsEnabled, boolean emailNotificationsEnabled) {
        User user = getUserProfile(userId);
        user.setGhostThresholdDays(ghostThresholdDays);
        user.setAutoArchiveEnabled(autoArchiveEnabled);
        user.setBrowserNotificationsEnabled(browserNotificationsEnabled);
        user.setEmailNotificationsEnabled(emailNotificationsEnabled);
        return userRepository.save(user);
    }

    @Transactional
    public User updateSettings(UUID userId, int ghostThresholdDays, boolean autoArchiveEnabled) {
        User user = getUserProfile(userId);
        user.setGhostThresholdDays(ghostThresholdDays);
        user.setAutoArchiveEnabled(autoArchiveEnabled);
        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(UUID userId) {
        User user = getUserProfile(userId);
        userRepository.delete(user);
        log.info("Permanently deleted user account: {}", user.getEmail());
    }

    @Transactional
    public User unlinkProvider(UUID userId, String provider) {
        User user = getUserProfile(userId);
        // Clean provider flag. Since the user may not have a local password, we preserve email but clear provider back to LOCAL.
        // In a real OAuth system, they might need to set a password first, but PRD allows simple unlinking.
        user.setAuthProvider("LOCAL");
        return userRepository.save(user);
    }

    @Transactional
    public User uploadAvatar(UUID userId, String originalFilename, byte[] bytes) {
        User user = getUserProfile(userId);
        
        String contentType = "image/png";
        if (originalFilename.toLowerCase().endsWith(".jpg") || originalFilename.toLowerCase().endsWith(".jpeg")) {
            contentType = "image/jpeg";
        } else if (originalFilename.toLowerCase().endsWith(".gif")) {
            contentType = "image/gif";
        }
        
        String s3Key = userId.toString() + "/avatar.png";
        storageService.uploadFile(avatarsBucket, s3Key, bytes, contentType);
        
        user.setAvatarUrl("/api/auth/users/" + userId + "/avatar");
        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public byte[] downloadAvatar(UUID userId) {
        User user = getUserProfile(userId);
        if (user.getAvatarUrl() == null) {
            throw new ResourceNotFoundException("No avatar uploaded");
        }
        
        String s3Key = userId.toString() + "/avatar.png";
        return storageService.downloadFile(avatarsBucket, s3Key);
    }

    @Transactional
    public User deleteAvatar(UUID userId) {
        User user = getUserProfile(userId);
        if (user.getAvatarUrl() != null) {
            String s3Key = userId.toString() + "/avatar.png";
            storageService.deleteFile(avatarsBucket, s3Key);
            user.setAvatarUrl(null);
            userRepository.save(user);
        }
        return user;
    }
}

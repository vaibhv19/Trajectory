package com.trajectory.backend.controller;

import com.trajectory.backend.dto.AuthResponse;
import com.trajectory.backend.dto.LoginRequest;
import com.trajectory.backend.dto.RegisterRequest;
import com.trajectory.backend.model.User;
import com.trajectory.backend.security.UserPrincipal;
import com.trajectory.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import com.trajectory.backend.dto.UserResponse;
import com.trajectory.backend.service.RefreshTokenService;
import com.trajectory.backend.security.JwtTokenProvider;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final RefreshTokenService refreshTokenService;
    private final JwtTokenProvider tokenProvider;

    public AuthController(UserService userService, 
                          RefreshTokenService refreshTokenService, 
                          JwtTokenProvider tokenProvider) {
        this.userService = userService;
        this.refreshTokenService = refreshTokenService;
        this.tokenProvider = tokenProvider;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = userService.registerUser(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = userService.loginUser(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> request) {
        String requestRefreshToken = request.get("refreshToken");
        if (requestRefreshToken == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Refresh token is missing"));
        }

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(com.trajectory.backend.model.RefreshToken::getUser)
                .map(user -> {
                    String token = tokenProvider.generateTokenForUser(com.trajectory.backend.security.UserPrincipal.create(user));
                    return ResponseEntity.ok(Map.of(
                            "token", token,
                            "refreshToken", requestRefreshToken
                    ));
                })
                .orElseGet(() -> ResponseEntity.badRequest().body(Map.of("message", "Refresh token not found")));
    }

    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        User user = userService.getUserProfile(principal.getId());
        return ResponseEntity.ok(UserResponse.fromEntity(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, String> request) {
        User user = userService.updateUserProfile(
                principal.getId(),
                request.get("fullName"),
                request.get("avatarUrl")
        );
        return ResponseEntity.ok(UserResponse.fromEntity(user));
    }

    @PutMapping("/settings")
    public ResponseEntity<UserResponse> updateSettings(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, Object> request) {
        int ghostThreshold = (int) request.getOrDefault("ghostThresholdDays", 30);
        boolean autoArchive = (boolean) request.getOrDefault("autoArchiveEnabled", false);
        
        User user = userService.updateSettings(principal.getId(), ghostThreshold, autoArchive);
        return ResponseEntity.ok(UserResponse.fromEntity(user));
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, String> request) {
        String oldPassword = request.get("oldPassword");
        String newPassword = request.get("newPassword");

        if (oldPassword == null || newPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Both old and new passwords are required"));
        }

        userService.changePassword(principal.getId(), oldPassword, newPassword);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }
}

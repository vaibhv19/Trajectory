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
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
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

    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        User user = userService.getUserProfile(principal.getId());
        // Do not return password hash in response
        user.setPasswordHash(null);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, String> request) {
        User user = userService.updateUserProfile(
                principal.getId(),
                request.get("fullName"),
                request.get("avatarUrl")
        );
        user.setPasswordHash(null);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/settings")
    public ResponseEntity<User> updateSettings(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, Object> request) {
        int ghostThreshold = (int) request.getOrDefault("ghostThresholdDays", 30);
        boolean autoArchive = (boolean) request.getOrDefault("autoArchiveEnabled", false);
        
        User user = userService.updateSettings(principal.getId(), ghostThreshold, autoArchive);
        user.setPasswordHash(null);
        return ResponseEntity.ok(user);
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

        try {
            userService.changePassword(principal.getId(), oldPassword, newPassword);
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}

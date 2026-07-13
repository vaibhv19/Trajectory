package com.trajectory.backend.controller;

import com.trajectory.backend.dto.*;
import com.trajectory.backend.model.User;
import com.trajectory.backend.security.UserPrincipal;
import com.trajectory.backend.service.DataMigrationService;
import com.trajectory.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final DataMigrationService migrationService;

    public UserController(UserService userService, DataMigrationService migrationService) {
        this.userService = userService;
        this.migrationService = migrationService;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        User user = userService.getUserProfile(principal.getId());
        return ResponseEntity.ok(mapToResponse(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateProfileRequest request) {
        User user = userService.updateUserProfile(principal.getId(), request.fullName(), request.avatarUrl());
        return ResponseEntity.ok(mapToResponse(user));
    }

    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(principal.getId(), request.oldPassword(), request.newPassword());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/settings")
    public ResponseEntity<UserResponse> updateSettings(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateSettingsRequest request) {
        User user = userService.updateSettings(
                principal.getId(),
                request.ghostThresholdDays(),
                request.autoArchiveEnabled(),
                request.browserNotificationsEnabled(),
                request.emailNotificationsEnabled()
        );
        return ResponseEntity.ok(mapToResponse(user));
    }

    @PostMapping("/unlink/{provider}")
    public ResponseEntity<UserResponse> unlinkProvider(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String provider) {
        User user = userService.unlinkProvider(principal.getId(), provider);
        return ResponseEntity.ok(mapToResponse(user));
    }

    @GetMapping("/export")
    public ResponseEntity<ExportDataResponse> exportData(@AuthenticationPrincipal UserPrincipal principal) {
        ExportDataResponse data = migrationService.exportData(principal.getId());
        return ResponseEntity.ok(data);
    }

    @PostMapping("/import")
    public ResponseEntity<Void> importData(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody ExportDataResponse importData) {
        migrationService.importData(principal.getId(), importData);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteAccount(@AuthenticationPrincipal UserPrincipal principal) {
        userService.deleteUser(principal.getId());
        return ResponseEntity.noContent().build();
    }

    private UserResponse mapToResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getAvatarUrl(),
                user.getAuthProvider(),
                user.getGhostThresholdDays(),
                user.isAutoArchiveEnabled(),
                user.isBrowserNotificationsEnabled(),
                user.isEmailNotificationsEnabled()
        );
    }
}

package com.trajectory.backend.dto;

import java.util.UUID;

public record UserResponse(
    UUID id,
    String email,
    String fullName,
    String avatarUrl,
    String authProvider,
    int ghostThresholdDays,
    boolean autoArchiveEnabled,
    boolean browserNotificationsEnabled,
    boolean emailNotificationsEnabled
) {
    public static UserResponse fromEntity(com.trajectory.backend.model.User user) {
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

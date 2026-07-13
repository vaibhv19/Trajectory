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
) {}

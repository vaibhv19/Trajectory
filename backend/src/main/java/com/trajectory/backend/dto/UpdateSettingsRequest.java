package com.trajectory.backend.dto;

import jakarta.validation.constraints.Min;

public record UpdateSettingsRequest(
    @Min(value = 1, message = "Ghost threshold must be at least 1 day")
    int ghostThresholdDays,
    boolean autoArchiveEnabled,
    boolean browserNotificationsEnabled,
    boolean emailNotificationsEnabled
) {}

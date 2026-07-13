package com.trajectory.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record ChangePasswordRequest(
    @NotBlank(message = "Current password is required")
    String oldPassword,
    @NotBlank(message = "New password is required")
    String newPassword
) {}

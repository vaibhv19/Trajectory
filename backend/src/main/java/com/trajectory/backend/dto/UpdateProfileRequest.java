package com.trajectory.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateProfileRequest(
    @NotBlank(message = "Full name is required")
    String fullName,
    String avatarUrl
) {}

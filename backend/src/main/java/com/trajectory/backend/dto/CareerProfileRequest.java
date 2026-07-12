package com.trajectory.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CareerProfileRequest(
    @NotBlank(message = "Title is required")
    String title,

    @Pattern(regexp = "^#[0-9a-fA-F]{6}$", message = "Color code must be a valid hex code (e.g., #3b82f6)")
    String colorCode,

    String iconIdentifier,

    boolean isDefault
) {}

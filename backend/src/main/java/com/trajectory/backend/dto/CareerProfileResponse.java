package com.trajectory.backend.dto;

import java.util.UUID;

public record CareerProfileResponse(
    UUID id,
    String title,
    String colorCode,
    String iconIdentifier,
    boolean isDefault
) {}

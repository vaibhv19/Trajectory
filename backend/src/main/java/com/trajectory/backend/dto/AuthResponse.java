package com.trajectory.backend.dto;

import java.util.UUID;

public record AuthResponse(
    String token,
    String email,
    String fullName,
    UUID userId
) {}

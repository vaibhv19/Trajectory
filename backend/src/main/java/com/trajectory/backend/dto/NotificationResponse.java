package com.trajectory.backend.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record NotificationResponse(
    UUID id,
    String title,
    String message,
    String type,
    boolean isRead,
    OffsetDateTime createdAt
) {}

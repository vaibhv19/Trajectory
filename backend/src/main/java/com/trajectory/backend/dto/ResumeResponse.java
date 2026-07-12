package com.trajectory.backend.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ResumeResponse(
    UUID id,
    UUID profileId,
    int versionNumber,
    String fileName,
    String changelog,
    OffsetDateTime createdAt
) {}

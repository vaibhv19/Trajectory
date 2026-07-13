package com.trajectory.backend.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public record ApplicationResponse(
    UUID id,
    String companyName,
    String roleTitle,
    CareerProfileResponse profile,
    UUID resumeId,
    Integer resumeVersion,
    String resumeFileName,
    String location,
    String jobDescriptionUrl,
    String jobDescriptionRaw,
    String status,
    String source,
    String salaryRange,
    LocalDate dateApplied,
    LocalDate followUpDate,
    LocalDate responseDate,
    OffsetDateTime lastActivityAt,
    boolean isArchived
) {}

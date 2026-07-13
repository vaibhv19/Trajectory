package com.trajectory.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.UUID;

public record ApplicationRequest(
    @NotBlank(message = "Company name is required")
    String companyName,

    @NotBlank(message = "Role title is required")
    String roleTitle,

    @NotNull(message = "Career Profile ID is required")
    UUID profileId,

    UUID resumeId,

    String location,
    String jobDescriptionUrl,
    String jobDescriptionRaw,
    String status, // Will be mapped to ApplicationStatus Enum
    String source,
    String salaryRange,
    LocalDate dateApplied,
    LocalDate followUpDate,
    LocalDate responseDate,
    Boolean isArchived,
    java.time.OffsetDateTime oaDateTime,
    java.time.OffsetDateTime interviewDateTime,
    String meetingLink
) {}

package com.trajectory.backend.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record ExportDataResponse(
    UserBackup user,
    List<CareerProfileBackup> profiles,
    List<ResumeBackup> resumes,
    List<ApplicationBackup> applications,
    List<StatusHistoryBackup> statusHistories,
    List<OutreachBackup> outreachLogs,
    List<DocumentBackup> documents
) {
    public record UserBackup(
        String email,
        String fullName,
        String avatarUrl,
        int ghostThresholdDays,
        boolean autoArchiveEnabled,
        boolean browserNotificationsEnabled,
        boolean emailNotificationsEnabled
    ) {}

    public record CareerProfileBackup(
        UUID id,
        String title,
        String colorCode,
        String iconIdentifier,
        boolean isDefault
    ) {}

    public record ResumeBackup(
        UUID id,
        UUID profileId,
        int versionNumber,
        String s3Key,
        String fileName,
        String changelog
    ) {}

    public record ApplicationBackup(
        UUID id,
        UUID profileId,
        UUID resumeId,
        String companyName,
        String roleTitle,
        String location,
        String jobDescriptionUrl,
        String jobDescriptionRaw,
        String status,
        String source,
        String salaryRange,
        LocalDate dateApplied,
        LocalDate followUpDate,
        LocalDate responseDate,
        boolean isArchived
    ) {}

    public record StatusHistoryBackup(
        UUID id,
        UUID applicationId,
        String status,
        String notes,
        OffsetDateTime changedAt
    ) {}

    public record OutreachBackup(
        UUID id,
        String contactName,
        String companyName,
        String positionDiscussed,
        String email,
        String linkedinUrl,
        String status,
        LocalDate dateSent,
        LocalDate followUpDate,
        String notes
    ) {}

    public record DocumentBackup(
        UUID id,
        String companyName,
        String documentName,
        String s3Key,
        String documentType
    ) {}
}

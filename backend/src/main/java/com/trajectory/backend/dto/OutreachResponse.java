package com.trajectory.backend.dto;

import java.time.LocalDate;
import java.util.UUID;

public record OutreachResponse(
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

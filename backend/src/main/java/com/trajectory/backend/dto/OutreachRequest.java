package com.trajectory.backend.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public record OutreachRequest(
    @NotBlank(message = "Contact name is required")
    String contactName,

    @NotBlank(message = "Company name is required")
    String companyName,

    @NotBlank(message = "Position discussed is required")
    String positionDiscussed,

    String email,
    String linkedinUrl,
    String status, // Will be mapped to OutreachStatus Enum
    LocalDate dateSent,
    LocalDate followUpDate,
    String notes
) {}

package com.trajectory.backend.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record CompanyDocumentResponse(
    UUID id,
    String companyName,
    String documentName,
    String documentType,
    String fileName,
    OffsetDateTime createdAt
) {}

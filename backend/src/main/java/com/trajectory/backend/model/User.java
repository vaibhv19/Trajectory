package com.trajectory.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @NotBlank
    @Email
    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "auth_provider")
    @Builder.Default
    private String authProvider = "LOCAL"; // LOCAL, GOOGLE, GITHUB

    @Column(name = "ghost_threshold_days")
    @Builder.Default
    private int ghostThresholdDays = 30;

    @Column(name = "auto_archive_enabled")
    @Builder.Default
    private boolean autoArchiveEnabled = false;

    @Column(name = "browser_notifications_enabled")
    @Builder.Default
    private boolean browserNotificationsEnabled = true;

    @Column(name = "email_notifications_enabled")
    @Builder.Default
    private boolean emailNotificationsEnabled = true;

    @Column(name = "ai_extractions_count")
    @Builder.Default
    private int aiExtractionsCount = 0;

    @Column(name = "last_ai_extraction_date")
    private java.time.LocalDate lastAiExtractionDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}

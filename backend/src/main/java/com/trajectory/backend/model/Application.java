package com.trajectory.backend.model;

import com.trajectory.backend.model.enums.ApplicationStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.PostgreSQLEnumJdbcType;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    private CareerProfile careerProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id")
    private Resume resume;

    @NotBlank
    @Column(name = "company_name", nullable = false)
    private String companyName;

    @NotBlank
    @Column(name = "role_title", nullable = false)
    private String roleTitle;

    private String location;

    @Column(name = "job_description_url", columnDefinition = "TEXT")
    private String jobDescriptionUrl;

    @Column(name = "job_description_raw", columnDefinition = "TEXT")
    private String jobDescriptionRaw;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(columnDefinition = "application_status")
    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.APPLIED;

    private String source;

    @Column(name = "salary_range")
    private String salaryRange;

    @Column(name = "date_applied")
    @Builder.Default
    private LocalDate dateApplied = LocalDate.now();

    @Column(name = "follow_up_date")
    private LocalDate followUpDate;

    @Column(name = "response_date")
    private LocalDate responseDate;

    @Column(name = "last_activity_at")
    @Builder.Default
    private OffsetDateTime lastActivityAt = OffsetDateTime.now();

    @Column(name = "is_archived", nullable = false)
    @Builder.Default
    private boolean isArchived = false;

    @Column(name = "oa_date_time")
    private OffsetDateTime oaDateTime;

    @Column(name = "interview_date_time")
    private OffsetDateTime interviewDateTime;

    @Column(name = "meeting_link")
    private String meetingLink;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}

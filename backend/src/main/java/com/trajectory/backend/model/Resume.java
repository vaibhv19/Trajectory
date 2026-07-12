package com.trajectory.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "resumes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"profile_id", "version_number"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    private CareerProfile careerProfile;

    @NotNull
    @Column(name = "version_number", nullable = false)
    private int versionNumber;

    @NotBlank
    @Column(name = "s3_key", nullable = false)
    private String s3Key;

    @NotBlank
    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(columnDefinition = "TEXT")
    private String changelog;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}

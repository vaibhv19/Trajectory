package com.trajectory.backend.service;

import com.trajectory.backend.dto.ApplicationRequest;
import com.trajectory.backend.dto.ApplicationResponse;
import com.trajectory.backend.dto.CareerProfileResponse;
import com.trajectory.backend.model.*;
import com.trajectory.backend.model.enums.ApplicationStatus;
import com.trajectory.backend.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final ApplicationStatusHistoryRepository statusHistoryRepository;
    private final UserRepository userRepository;
    private final CareerProfileRepository careerProfileRepository;
    private final ResumeRepository resumeRepository;

    public ApplicationService(ApplicationRepository applicationRepository,
                              ApplicationStatusHistoryRepository statusHistoryRepository,
                              UserRepository userRepository,
                              CareerProfileRepository careerProfileRepository,
                              ResumeRepository resumeRepository) {
        this.applicationRepository = applicationRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.userRepository = userRepository;
        this.careerProfileRepository = careerProfileRepository;
        this.resumeRepository = resumeRepository;
    }

    @Transactional(readOnly = true)
    public Page<ApplicationResponse> searchApplications(
            UUID userId, String search, List<ApplicationStatus> statuses, UUID profileId, boolean isArchived, Pageable pageable) {
        
        Page<Application> apps = applicationRepository.searchApplications(
                userId, 
                search == null || search.trim().isEmpty() ? null : search, 
                statuses, 
                profileId, 
                isArchived,
                pageable
        );

        return apps.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public ApplicationResponse getApplication(UUID userId, UUID id) {
        Application app = applicationRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        return mapToResponse(app);
    }

    @Transactional
    public ApplicationResponse createApplication(UUID userId, ApplicationRequest request) {
        User user = userRepository.findById(userId).orElseThrow();

        // Duplicate check (Company + Role) among active applications
        if (applicationRepository.existsByUserIdAndCompanyNameIgnoreCaseAndRoleTitleIgnoreCaseAndIsArchivedFalse(
                userId, request.companyName(), request.roleTitle())) {
            throw new IllegalArgumentException("You have already added an active application for " + request.roleTitle() + " at " + request.companyName());
        }

        CareerProfile profile = careerProfileRepository.findById(request.profileId())
                .filter(p -> p.getUser().getId().equals(userId))
                .orElseThrow(() -> new RuntimeException("Career profile not found"));

        // Date Validation
        LocalDate appliedDate = request.dateApplied() != null ? request.dateApplied() : LocalDate.now();
        if (request.followUpDate() != null && request.followUpDate().isBefore(appliedDate)) {
            throw new IllegalArgumentException("Follow-up date cannot be before the applied date.");
        }

        // Auto-select latest resume if not specified
        Resume resume = null;
        if (request.resumeId() != null) {
            resume = resumeRepository.findById(request.resumeId()).orElse(null);
        } else {
            resume = resumeRepository.findFirstByCareerProfileIdOrderByVersionNumberDesc(profile.getId()).orElse(null);
        }

        ApplicationStatus status = ApplicationStatus.APPLIED;
        if (request.status() != null) {
            try {
                status = ApplicationStatus.valueOf(request.status().toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid status value provided: {}, defaulting to APPLIED", request.status());
            }
        }

        // Auto-Archive Logic
        boolean shouldArchive = (status == ApplicationStatus.REJECTED || status == ApplicationStatus.GHOSTED) && user.isAutoArchiveEnabled();
        boolean isArchived = request.isArchived() != null ? request.isArchived() : shouldArchive;

        Application app = Application.builder()
                .user(user)
                .careerProfile(profile)
                .resume(resume)
                .companyName(request.companyName())
                .roleTitle(request.roleTitle())
                .location(request.location())
                .jobDescriptionUrl(request.jobDescriptionUrl())
                .jobDescriptionRaw(request.jobDescriptionRaw())
                .status(status)
                .source(request.source())
                .salaryRange(request.salaryRange())
                .dateApplied(appliedDate)
                .followUpDate(request.followUpDate())
                .responseDate(request.responseDate())
                .isArchived(isArchived)
                .lastActivityAt(OffsetDateTime.now())
                .build();

        Application saved = applicationRepository.save(app);

        // Add history transition
        ApplicationStatusHistory history = ApplicationStatusHistory.builder()
                .application(saved)
                .status(saved.getStatus())
                .notes("Application created")
                .build();
        statusHistoryRepository.save(history);

        log.info("Saved application for {} at {}", saved.getRoleTitle(), saved.getCompanyName());
        return mapToResponse(saved);
    }

    @Transactional
    public ApplicationResponse updateApplication(UUID userId, UUID id, ApplicationRequest request) {
        Application app = applicationRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        CareerProfile profile = careerProfileRepository.findById(request.profileId())
                .filter(p -> p.getUser().getId().equals(userId))
                .orElseThrow(() -> new RuntimeException("Career profile not found"));

        // Date Validation
        LocalDate appliedDate = request.dateApplied() != null ? request.dateApplied() : app.getDateApplied();
        if (request.followUpDate() != null && request.followUpDate().isBefore(appliedDate)) {
            throw new IllegalArgumentException("Follow-up date cannot be before the applied date.");
        }

        Resume resume = null;
        if (request.resumeId() != null) {
            resume = resumeRepository.findById(request.resumeId()).orElse(null);
        }

        ApplicationStatus nextStatus = app.getStatus();
        if (request.status() != null) {
            try {
                nextStatus = ApplicationStatus.valueOf(request.status().toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid status value: {}", request.status());
            }
        }

        boolean statusChanged = !app.getStatus().equals(nextStatus);

        // Auto-Archive Logic
        boolean shouldArchive = (nextStatus == ApplicationStatus.REJECTED || nextStatus == ApplicationStatus.GHOSTED) && app.getUser().isAutoArchiveEnabled();
        boolean isArchived = request.isArchived() != null ? request.isArchived() : (statusChanged ? shouldArchive : app.isArchived());

        app.setCareerProfile(profile);
        app.setResume(resume);
        app.setCompanyName(request.companyName());
        app.setRoleTitle(request.roleTitle());
        app.setLocation(request.location());
        app.setJobDescriptionUrl(request.jobDescriptionUrl());
        app.setJobDescriptionRaw(request.jobDescriptionRaw());
        app.setStatus(nextStatus);
        app.setSource(request.source());
        app.setSalaryRange(request.salaryRange());
        app.setDateApplied(appliedDate);
        app.setFollowUpDate(request.followUpDate());
        app.setResponseDate(request.responseDate());
        app.setArchived(isArchived);
        app.setLastActivityAt(OffsetDateTime.now());

        Application saved = applicationRepository.save(app);

        if (statusChanged) {
            ApplicationStatusHistory history = ApplicationStatusHistory.builder()
                    .application(saved)
                    .status(saved.getStatus())
                    .notes("Status changed via update")
                    .build();
            statusHistoryRepository.save(history);
        }

        return mapToResponse(saved);
    }

    @Transactional
    public void deleteApplication(UUID userId, UUID id) {
        Application app = applicationRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        applicationRepository.delete(app);
        log.info("Deleted application {}", id);
    }

    @Transactional(readOnly = true)
    public List<ApplicationStatusHistory> getStatusHistory(UUID userId, UUID applicationId) {
        // Validate ownership
        applicationRepository.findByIdAndUserId(applicationId, userId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        return statusHistoryRepository.findByApplicationIdOrderByChangedAtAsc(applicationId);
    }

    public ApplicationResponse mapToResponse(Application app) {
        CareerProfileResponse profileResponse = new CareerProfileResponse(
                app.getCareerProfile().getId(),
                app.getCareerProfile().getTitle(),
                app.getCareerProfile().getColorCode(),
                app.getCareerProfile().getIconIdentifier(),
                app.getCareerProfile().isDefault()
        );

        UUID resumeId = app.getResume() != null ? app.getResume().getId() : null;
        Integer resumeVersion = app.getResume() != null ? app.getResume().getVersionNumber() : null;
        String resumeFileName = app.getResume() != null ? app.getResume().getFileName() : null;

        return new ApplicationResponse(
                app.getId(),
                app.getCompanyName(),
                app.getRoleTitle(),
                profileResponse,
                resumeId,
                resumeVersion,
                resumeFileName,
                app.getLocation(),
                app.getJobDescriptionUrl(),
                app.getJobDescriptionRaw(),
                app.getStatus().name(),
                app.getSource(),
                app.getSalaryRange(),
                app.getDateApplied(),
                app.getFollowUpDate(),
                app.getResponseDate(),
                app.getLastActivityAt(),
                app.isArchived()
        );
    }
}

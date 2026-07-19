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
import com.trajectory.backend.exception.ResourceNotFoundException;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final ApplicationStatusHistoryRepository statusHistoryRepository;
    private final UserRepository userRepository;
    private final CareerProfileRepository careerProfileRepository;
    private final ResumeRepository resumeRepository;
    private final NotificationService notificationService;

    public ApplicationService(ApplicationRepository applicationRepository,
                              ApplicationStatusHistoryRepository statusHistoryRepository,
                              UserRepository userRepository,
                              CareerProfileRepository careerProfileRepository,
                              ResumeRepository resumeRepository,
                              NotificationService notificationService) {
        this.applicationRepository = applicationRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.userRepository = userRepository;
        this.careerProfileRepository = careerProfileRepository;
        this.resumeRepository = resumeRepository;
        this.notificationService = notificationService;
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
        Application application = applicationRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));
        return mapToResponse(application);
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
                .orElseThrow(() -> new ResourceNotFoundException("Career profile not found"));

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
                .oaDateTime(request.oaDateTime())
                .interviewDateTime(request.interviewDateTime())
                .meetingLink(request.meetingLink())
                .build();

        Application saved = applicationRepository.save(app);

        // Auto create reminders if date/time is provided
        if (saved.getOaDateTime() != null) {
            String linkStr = saved.getMeetingLink() != null && !saved.getMeetingLink().isEmpty() ? " Link: " + saved.getMeetingLink() : "";
            notificationService.createNotification(
                userId, 
                "OA Scheduled Reminder", 
                "Online Assessment scheduled for " + saved.getRoleTitle() + " at " + saved.getCompanyName() + " on " + saved.getOaDateTime() + "." + linkStr, 
                "AGENDA"
            );
        }
        if (saved.getInterviewDateTime() != null) {
            String linkStr = saved.getMeetingLink() != null && !saved.getMeetingLink().isEmpty() ? " Link: " + saved.getMeetingLink() : "";
            notificationService.createNotification(
                userId, 
                "Interview Scheduled Reminder", 
                "Interview scheduled for " + saved.getRoleTitle() + " at " + saved.getCompanyName() + " on " + saved.getInterviewDateTime() + "." + linkStr, 
                "AGENDA"
            );
        }

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
        Application application = applicationRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        CareerProfile profile = careerProfileRepository.findById(request.profileId())
                .filter(p -> p.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Career profile not found"));

        // Date Validation
        LocalDate appliedDate = request.dateApplied() != null ? request.dateApplied() : application.getDateApplied();
        if (request.followUpDate() != null && request.followUpDate().isBefore(appliedDate)) {
            throw new IllegalArgumentException("Follow-up date cannot be before the applied date.");
        }

        Resume resume = null;
        if (request.resumeId() != null) {
            resume = resumeRepository.findById(request.resumeId()).orElse(null);
        }

        ApplicationStatus nextStatus = application.getStatus();
        if (request.status() != null) {
            try {
                nextStatus = ApplicationStatus.valueOf(request.status().toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid status value: {}", request.status());
            }
        }

        boolean statusChanged = !application.getStatus().equals(nextStatus);

        // Auto-Archive Logic
        boolean shouldArchive = (nextStatus == ApplicationStatus.REJECTED || nextStatus == ApplicationStatus.GHOSTED) && application.getUser().isAutoArchiveEnabled();
        boolean isArchived = request.isArchived() != null ? request.isArchived() : (statusChanged ? shouldArchive : application.isArchived());

        boolean oaUpdated = request.oaDateTime() != null && (application.getOaDateTime() == null || !application.getOaDateTime().equals(request.oaDateTime()));
        boolean interviewUpdated = request.interviewDateTime() != null && (application.getInterviewDateTime() == null || !application.getInterviewDateTime().equals(request.interviewDateTime()));

        application.setCareerProfile(profile);
        application.setResume(resume);
        application.setCompanyName(request.companyName());
        application.setRoleTitle(request.roleTitle());
        application.setLocation(request.location());
        application.setJobDescriptionUrl(request.jobDescriptionUrl());
        application.setJobDescriptionRaw(request.jobDescriptionRaw());
        application.setStatus(nextStatus);
        application.setSource(request.source());
        application.setSalaryRange(request.salaryRange());
        application.setDateApplied(appliedDate);
        application.setFollowUpDate(request.followUpDate());
        application.setResponseDate(request.responseDate());
        application.setArchived(isArchived);
        application.setOaDateTime(request.oaDateTime());
        application.setInterviewDateTime(request.interviewDateTime());
        application.setMeetingLink(request.meetingLink());
        application.setLastActivityAt(OffsetDateTime.now());

        Application saved = applicationRepository.save(application);

        if (oaUpdated) {
            String linkStr = saved.getMeetingLink() != null && !saved.getMeetingLink().isEmpty() ? " Link: " + saved.getMeetingLink() : "";
            notificationService.createNotification(
                userId, 
                "OA Scheduled Reminder", 
                "Online Assessment scheduled for " + saved.getRoleTitle() + " at " + saved.getCompanyName() + " on " + saved.getOaDateTime() + "." + linkStr, 
                "AGENDA"
            );
        }
        if (interviewUpdated) {
            String linkStr = saved.getMeetingLink() != null && !saved.getMeetingLink().isEmpty() ? " Link: " + saved.getMeetingLink() : "";
            notificationService.createNotification(
                userId, 
                "Interview Scheduled Reminder", 
                "Interview scheduled for " + saved.getRoleTitle() + " at " + saved.getCompanyName() + " on " + saved.getInterviewDateTime() + "." + linkStr, 
                "AGENDA"
            );
        }

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
        Application application = applicationRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));
        applicationRepository.delete(application);
        log.info("Deleted application {}", id);
    }

    @Transactional(readOnly = true)
    public List<ApplicationStatusHistory> getStatusHistory(UUID userId, UUID applicationId) {
        // Validate ownership
        applicationRepository.findByIdAndUserId(applicationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

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
                app.isArchived(),
                app.getOaDateTime(),
                app.getInterviewDateTime(),
                app.getMeetingLink()
        );
    }
}
